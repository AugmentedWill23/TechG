<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { cash, speed, time, language, gameFeatures, STARTING_DATE, selectedLanguage } from '$lib/ts/stores/Stores';
	import {
		calculateGenreFactorMatrix,
		generateRandomGame,
		getGameFeatureProgress,
		runHypeStep,
		runStep,
		getTotalSaleLast30Days,
		getTotalSale,
		generateQuarterlyReviewsAll
	} from '$lib/ts/classes/Game';
	import { SoftwareReleaseLifeCycle } from '$lib/ts/enums/SoftwareReleaseLifeCycle';
	import { get } from 'svelte/store';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { Random } from '$lib/ts/namespaces/Random';
	import { AudioMixer } from '$lib/ts/namespaces/AudioMixer';
	import { goto } from '$app/navigation';
	import { Utility } from '$lib/ts/namespaces/Utility';
	import { runRandomEvents } from '$lib/ts/classes/RandomEvents';

	import moreIcon from '$lib/assets/icons/icon_more.svg';
	import gameIcon from '$lib/assets/icons/icon_game.svg';
	import teamIcon from '$lib/assets/icons/icon_team.svg';
	import marketIcon from '$lib/assets/icons/icon_market.svg';
	import companyIcon from '$lib/assets/icons/icon_company.svg';
	import researchIcon from '$lib/assets/icons/icon_research.svg';
	import exitIcon from '$lib/assets/icons/icon_exit.svg';

	import { buildings, gameProjects, hardwareProjects, newslist, platforms, saves, teams } from '$lib/ts/stores/Stores';
	import Card from '$lib/components/Card.svelte';
	import StepProgress from '$lib/components/StepProgress.svelte';
	import GraphNew from '$lib/components/Graph.svelte';
	import type { Team } from '$lib/ts/classes/Team';
	import { Hardware } from '$lib/ts/classes/Hardware';
	import Progress from '$lib/components/Progress.svelte';

	import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import { platformRunStep, platformRunStepYearly } from '$lib/ts/classes/Platform';
	import { featureRunStep } from '$lib/ts/classes/Feature';
	import { buildingRunStep } from '$lib/ts/classes/Building';

	export let data: LayoutData;

	AudioMixer.playTrack(AudioMixer.filenames[1]);

	$: {
		// run initial step, for new game so platforms are, released to the market at starting date

		if ($time === STARTING_DATE) {
			$platforms.map((p) => platformRunStep(p, $time));
			platforms.refresh();
		}
	}

	time.registerCallback(
		1,
		'yearly',
		(currentDate: Date) => {
			get(platforms).map((p) => platformRunStepYearly(p));
			platforms.refresh();
		},
		true
	);

	time.registerCallback(
		2,
		'daily',
		(currentDate: Date) => {
			calculateGenreFactorMatrix();

			get(platforms).map((p) => platformRunStep(p, currentDate));
			platforms.refresh();

			get(gameProjects).map((g) => runHypeStep(g, currentDate));
			gameProjects.refresh();

			get(teams).map((t: Team) => {
				t.employees.map((e) => {
					e.energy = e.maxenergy;
				});
			});

			if (Random.Random01() < 0.1) {
				gameProjects.add(generateRandomGame());
			}
		},
		true
	);

	time.registerCallback(
		3,
		'monthly',
		(currentDate: Date) => {
			$teams.map((team) => {
				for (const employee of team.employees) {
					const salary = employee.salary;
					const name = employee.fullName;

					cash.add(name, -salary);
				}
			});

			get(buildings).map((b) => buildingRunStep(b, currentDate));
			buildings.refresh();
		},
		true
	);

	// run random events every 2 weeks (bi-weekly) and weekly checks for reviews
	time.registerCallback(
		5,
		'weekly',
		(currentDate: Date) => {
			const daysFromStart = Utility.countDays(STARTING_DATE, currentDate);
			// every 14 days
			if (daysFromStart % 14 === 0) {
				runRandomEvents(currentDate);
			}

			// run review generator weekly (generateReviewsIfDue will guard by lastQuarterlyReviewAt)
			generateQuarterlyReviewsAll(currentDate);
			platforms.refresh();
			gameProjects.refresh();
		},
		true
	);

	time.registerCallback(
		4,
		'hourly',
		(currentDate: Date) => {
			checkBankruptcy();

			get(gameProjects).map((g) => runStep(g, currentDate));
			gameProjects.refresh();

			$hardwareProjects.map((h) => Hardware.runStep(h));
			hardwareProjects.refresh();

			get(gameFeatures).map((f) => featureRunStep(f, currentDate));
			gameFeatures.refresh();
		},
		true
	);

	function checkBankruptcy() {
		const c = get(cash);

		if (c < 0) {
			goto(`${base}/${data.saveId}/bankrupt`);
		}
	}

	$: projectsInDev = $gameProjects.filter(
		(x) => x.phase < SoftwareReleaseLifeCycle.Release && x.developerId === 'MYCOMPANY'
	);

	$: projectUnderWork = $gameProjects.filter(
		(x) => x.phase <= SoftwareReleaseLifeCycle.Release && x.developerId === 'MYCOMPANY'
	);

	$: projectOnSale = $gameProjects.filter(
		(x) =>
			(x.phase === SoftwareReleaseLifeCycle.Release || x.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue) &&
			x.developerId === 'MYCOMPANY'
	);

	$: projectDiscontinued = $gameProjects.filter(
		(x) => x.phase == SoftwareReleaseLifeCycle.Discontinue && x.developerId === 'MYCOMPANY'
	);

	$: allProjectsOnSaleSortedByUnitSoldRank = $gameProjects
		.filter(
			(x) => x.phase === SoftwareReleaseLifeCycle.Release || x.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue
		)
		.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);

	$: hardwareProjectsInDev = $hardwareProjects.filter((x) => x.developerId === 'MYCOMPANY');

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact'
	});

	$: cashFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		minimumFractionDigits: 2
	});

	$: cashFormatterLong = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'standard',
		minimumFractionDigits: 2
	});

	$: timeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});

	$: timeFormatter2x = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});

	$: isThereNewNews = $newslist.filter((obj) => !obj.hasOwnProperty('seen')).length > 0;

	$: featuresBeingResearched = $gameFeatures.filter((feature) => feature.isBeingResearched);

	function exitToMainMenu() {
		goto(`${base}/`);
		saves.select(undefined);
	}
</script>

<header>
	<div
		style="display: flex;gap: 7pt;border-bottom: 1px solid var(--border-color-default);padding: 0.5rem; align-items: flex-start;">
		<Dropdown>
			<button style="width: 3rem;height: 3rem; background-color: var(--secondary-background-color)" slot="button">
				<img src={moreIcon} alt="" />
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/game`)}>
				<img src={gameIcon} alt="" />
				<div>{$language.CREATE_GAME}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/employee`)}>
				<img src={teamIcon} alt="" />
				<div>{$language.TEAM_MANAGMENT}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/company`)}>
				<img src={companyIcon} alt="" />
				<div>{$language.COMPANY}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/market`)}>
				<img src={marketIcon} alt="" />
				<div>{$language.MARKET}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/research`)}>
				<img src={researchIcon} alt="" />
				<div>{$language.RESEARCH}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={exitToMainMenu}>
				<img src={exitIcon} alt="" />
				<div>{$language.EXIT_TO_MAIN_MENU}</div>
			</button>
		</Dropdown>

		<nav>
			<slot name="pre" />

			<div class="timecontrol">
				<button class:selected-yellow={$speed === 0} on:click={() => speed.pause()}>
					<Icon src={import("$assets/icons/icon_pause.svg?raw")} />
				</button>
				<button class:selected={$speed === 1} on:click={() => speed.play()}>
					<Icon src={import("$assets/icons/icon_play.svg?raw")} />
				</button>
				<button class:selected={$speed === 2} on:click={() => speed.fastForward()}>
					<Icon src={import("$assets/icons/icon_play2x.svg?raw")} />
				</button>
			</div>

			<div class="timecontrol-small">
				{#if $speed === 1}
					<button class:selected={true} on:click={() => speed.fastForward()}>
						<Icon src={import("$assets/icons/icon_play.svg?raw")} />
					</button>
				{:else if $speed === 2}
					<button class:selected={true} on:click={() => speed.pause()}>
						<Icon src={import("$assets/icons/icon_play2x.svg?raw")} />
					</button>
				{:else}
					<button class:selected-yellow={true} on:click={() => speed.play()}>
						<Icon src={import("$assets/icons/icon_pause.svg?raw")} />
					</button>
				{/if}
			</div>

			<button class:time disabled>
				{#if $speed === 1}
					{timeFormatter.format($time)}
				{:else if $speed === 2}
					{timeFormatter2x.format($time)}
				{:else}
					{timeFormatter.format($time)}
				{/if}
			</button>

			<button class:cash disabled title={cashFormatterLong.format($cash)}>{cashFormatter.format($cash)}</button>

			<button class={'news'} class:blink={isThereNewNews} on:click={() => goto(`${base}/${data.saveId}/news`)}>
				<Icon src={import("$assets/icons/icon_news.svg?raw")} />
			</button>

			<slot />
		</nav>
	</div>
</header>

<main style="overflow: auto;background-color: var(--primary-background-color); padding:1rem">
<!-- rest unchanged -->
</main>
