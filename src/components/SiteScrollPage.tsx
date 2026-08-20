'use client'

import { GoodreadsIcon, InstagramIcon, LetterboxdIcon } from './BrandIcons'
import Gradient from './Gradient'
import SectionHeading from './SectionHeading'
import SiteNav from './SiteNav'
import StarClearZone from './StarClearZone'
import { useStarBurst } from './StarBackgroundProvider'
import { workBlocks } from '../data/work-blocks'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const favoriteMovies = [
    '2001: A Space Odyssey (1968)',
    'Before Sunset (2004)',
    "Pan's Labyrinth (2006)",
    'There Will Be Blood (2007)',
    'The Curious Case of Benjamin Button (2008)',
    'Burning (2018)',
    'The Worst Person in the World (2021)',
    'Aftersun (2022)',
    'La Chimera (2023)',
    'Perfect Days (2023)',
    'Crossing (2024)',
    'Bugonia (2025)',
    'Train Dreams (2025)',
] as const

const favoriteBooks: { title: string; author: string }[] = [
    { title: 'Permutation City', author: 'Greg Egan' },
    {
        title: 'Consolations: The Solace, Nourishment and Underlying Meaning of Everyday Words',
        author: 'David Whyte',
    },
    { title: 'The Hour of the Star', author: 'Clarice Lispector' },
    { title: 'Star Maker', author: 'Olaf Stapledon' },
    { title: 'The Paper Menagerie and Other Stories', author: 'Ken Liu' },
    { title: 'Constellations', author: 'Sinéad Gleeson' },
    { title: 'When We Cease to Understand the World', author: 'Benjamín Labatut' },
    { title: 'Mrs. Dalloway', author: 'Virginia Woolf' },
    { title: 'East of Eden', author: 'John Steinbeck' },
]

const currentMusicObsession = [
    'Arcade Fire',
    'Altın Gün',
    'Ezra Collective',
    'Angine de Poitrine',
] as const

const NAV_HASHES = ['#about', '#work', '#fun', '#contact'] as const

function normalizeNavHash(h: string): (typeof NAV_HASHES)[number] {
    if (NAV_HASHES.includes(h as (typeof NAV_HASHES)[number])) return h as (typeof NAV_HASHES)[number]
    return '#about'
}

function siteUrl(hash: string): string {
    return `/site${hash}`
}

/** Main section labels only: matches SiteNav “active” bar + tint. */
const SECTION_LABEL_CLASS =
    'inline-flex w-max max-w-full items-center border-l-2 border-emerald-400 bg-emerald-500/10 py-1.5 pl-2 pr-3 font-mono text-base font-normal uppercase tracking-[0.14em] text-emerald-100 sm:text-lg'

const aboutSubsectionBox =
    'flex min-h-0 min-w-0 flex-col border border-gray-700/70 bg-gray-900/40 p-4 sm:p-5'

const aboutSubsectionTitle = 'text-sm font-semibold tracking-wide text-blue-200'

const funSubsectionBox = aboutSubsectionBox

export default function SiteScrollPage() {
    const router = useRouter()
    const { triggerBurst } = useStarBurst()
    const [activeHash, setActiveHash] = useState('#about')
    const [navBusy, setNavBusy] = useState(false)
    const [cursorTarget, setCursorTarget] = useState<'heading' | 'nav'>('heading')
    const cursorTargetRef = useRef<'heading' | 'nav'>('heading')
    const intersectingRef = useRef(new Set<string>())
    const [expandedFun, setExpandedFun] = useState<Set<string>>(new Set())

    const toggleFun = useCallback((key: string) => {
        setExpandedFun(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }, [])

    const updateCursorTarget = useCallback((target: 'heading' | 'nav') => {
        cursorTargetRef.current = target
        setCursorTarget(target)
    }, [])

    useEffect(() => {
        const sync = () => {
            const raw = window.location.hash
            if (!raw || raw === '#') setActiveHash('#about')
            else setActiveHash(normalizeNavHash(raw))
        }
        sync()
        window.addEventListener('hashchange', sync)
        return () => window.removeEventListener('hashchange', sync)
    }, [])

    useEffect(() => {
        let raw = window.location.hash
        if (!raw || raw === '#') {
            window.history.replaceState(null, '', siteUrl('#about'))
            raw = '#about'
        }
        const id = normalizeNavHash(raw).slice(1)
        requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }, [])

    useEffect(() => {
        const sectionIds = ['about', 'work', 'fun', 'contact']
        const elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) intersectingRef.current.add(entry.target.id)
                    else intersectingRef.current.delete(entry.target.id)
                })
                if (cursorTargetRef.current !== 'heading') return
                const active = sectionIds.find(id => intersectingRef.current.has(id))
                if (active) {
                    const hash = `#${active}`
                    setActiveHash(hash)
                    window.history.replaceState(null, '', siteUrl(hash))
                }
            },
            { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
        )

        elements.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const onUserScroll = () => updateCursorTarget('heading')
        window.addEventListener('wheel', onUserScroll, { passive: true })
        window.addEventListener('touchmove', onUserScroll, { passive: true })
        return () => {
            window.removeEventListener('wheel', onUserScroll)
            window.removeEventListener('touchmove', onUserScroll)
        }
    }, [updateCursorTarget])

    const goToLanding = useCallback(() => {
        if (navBusy) return
        setNavBusy(true)
        triggerBurst()
        window.setTimeout(() => {
            router.push('/')
            setNavBusy(false)
        }, 180)
    }, [navBusy, triggerBurst, router])

    const navigateToHash = useCallback(
        (hash: string) => {
            if (navBusy) return
            const target = normalizeNavHash(hash)
            setNavBusy(true)
            triggerBurst()
            updateCursorTarget('nav')
            window.setTimeout(() => {
                const id = target.slice(1)
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                window.history.replaceState(null, '', siteUrl(target))
                setActiveHash(target)
                setNavBusy(false)
            }, 180)
        },
        [navBusy, triggerBurst, updateCursorTarget]
    )

    return (
        <main className="relative min-h-screen bg-gray-800 text-gray-100">
            <header className="sticky top-0 z-40 border-b border-gray-700/50 bg-gray-800/92 px-4 py-2 backdrop-blur-md sm:px-6 sm:py-3">
                <div className="mx-auto flex max-w-5xl flex-col gap-1.5 sm:flex-row sm:gap-3 sm:items-start sm:justify-between">
                    <Gradient onLogoClick={goToLanding} />
                    <SiteNav onNavigate={navigateToHash} activeHash={activeHash} disabled={navBusy} showCaret={cursorTarget === 'nav'} className="sm:pt-1" />
                </div>
            </header>

            <StarClearZone className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 pt-10 sm:pt-12">
                <section id="about" className="scroll-mt-36 flex flex-col gap-10 sm:scroll-mt-32">
                    <header className="mb-1">
                        <SectionHeading className={SECTION_LABEL_CLASS} showCursor={cursorTarget === 'heading' && activeHash === '#about'}>About</SectionHeading>
                    </header>
                    <div className="border border-gray-700/70 bg-gray-900/40 p-6">
                        <div className="mx-auto mb-4 w-full max-w-[300px] overflow-hidden rounded-lg bg-gray-900/40 shadow-[0_8px_28px_rgba(0,0,0,0.32)] sm:float-right sm:mb-2 sm:ml-6 sm:mt-20 sm:w-60 xl:w-64">
                            <img
                                src="/pp/pp.JPG"
                                alt="Portrait"
                                className="aspect-square h-auto w-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold uppercase tracking-[0.12em] text-blue-200">
                            Research Engineer @ UK AISI
                        </h2>
                        <p className="mt-3 text-sm italic text-blue-200">
                            Former quant hedge fund analytics person turned professional AI safety person. 🤖❤️🌎
                        </p>
                        <ul
                            className="mt-3 list-none space-y-2.5 border-l border-emerald-500/25 pl-4 text-sm text-gray-300 sm:pl-5 sm:text-base"
                            role="list"
                        >
                            <li className="flex gap-2.5">
                                <span className="font-mono text-emerald-500/90" aria-hidden>
                                    &gt;
                                </span>
                                <span className="min-w-0 leading-relaxed">
                                    I discovered AI safety during a career break and realized it was the most impactful thing I could be doing
                                    given my existing skills. It&apos;s a unique time in history to be a CS nerd. So I went for
                                    it. 🚀
                                </span>
                            </li>
                            <li className="flex gap-2.5">
                                <span className="font-mono text-emerald-500/90" aria-hidden>
                                    &gt;
                                </span>
                                <span className="min-w-0 leading-relaxed">
                                    I feel a deep unease at the thought of living a life for just myself. I plan to reduce human suffering and contribute to human flourishing as much as possible, and intend to shape my career in this direction. If you&apos;re also intrigued by a similar purpose, I suggest you check out <a href="https://80000hours.org/career-guide/" target="_blank" style={{}}><strong>this page</strong></a>.
                                </span>
                            </li>
                            <li className="flex gap-2.5">
                                <span className="font-mono text-emerald-500/90" aria-hidden>
                                    &gt;
                                </span>
                                <span className="min-w-0 leading-relaxed">
                                    My current team,<i>The Cyber and Autonomous Systems Team (CAST)</i>, researches frontier AI capabilities and
                                    propensities to inform high-stakes security decisions around cyber risk and autonomous misuse. Current focus
                                    includes eval infrastructure, cyber ranges, and model capability testing before release, with
                                    collaboration across government, industry, and research partners.
                                </span>
                            </li>
                            <li className="flex gap-2.5">
                                <span className="font-mono text-emerald-500/90" aria-hidden>
                                    &gt;
                                </span>
                                <span className="min-w-0 leading-relaxed">
                                    I received a B.S. in Computational and Applied Mathematics from the University of Chicago.
                                    In my previous life I&apos;ve worked at multi-strategy hedge fund Walleye Capital, and quant hedge fund AQR Capital Management, with internships at AQR and Citadel, and a research assistantship at UChicago Booth.
                                </span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="work" className="scroll-mt-36 mt-16 flex flex-col gap-6 sm:scroll-mt-32">
                    <header className="mb-1">
                        <SectionHeading className={SECTION_LABEL_CLASS} showCursor={cursorTarget === 'heading' && activeHash === '#work'}>Work</SectionHeading>
                    </header>
                    <div className="space-y-5">
                        {workBlocks.map((item) => (
                            <article key={item.title} className="border border-gray-700/70 bg-gray-900/45 p-5">
                                <div className="grid gap-5 md:grid-cols-[1fr_320px] md:items-start">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-xs uppercase tracking-[0.14em] text-blue-200">{item.date}</p>
                                            <p className="text-xs uppercase tracking-[0.12em] text-gray-400">{item.venue}</p>
                                        </div>
                                        <h2 className="mt-2 text-xl font-semibold text-gray-100">{item.title}</h2>

                                        <ul
                                            className="mt-4 list-none space-y-2.5 border-l border-emerald-500/25 pl-4 text-sm text-gray-300 sm:pl-5 sm:text-base"
                                            role="list"
                                        >
                                            {item.highlights.map((point) => (
                                                <li key={point} className="flex gap-2.5">
                                                    <span className="font-mono text-emerald-500/90" aria-hidden>
                                                        &gt;
                                                    </span>
                                                    <span className="min-w-0 leading-relaxed">{point}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {item.links.map((link) => (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-none border border-blue-400/70 bg-gray-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-200 transition-colors hover:border-blue-300 hover:bg-blue-950/40"
                                                >
                                                    {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <a
                                        href={item.links[0]?.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block border border-gray-700/80 bg-gray-950/70 p-3 transition-colors hover:border-blue-300/80"
                                    >
                                        <img
                                            src={item.previewImage}
                                            alt={`${item.title} preview`}
                                            className="h-44 w-full object-cover"
                                        />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="fun" className="scroll-mt-36 mt-16 flex flex-col gap-4 sm:scroll-mt-32">
                    <header className="mb-1">
                        <SectionHeading className={SECTION_LABEL_CLASS} showCursor={cursorTarget === 'heading' && activeHash === '#fun'}>Fun</SectionHeading>
                    </header>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
                        <div className="flex flex-col gap-4">
                        <section className={funSubsectionBox}>
                            <button type="button" onClick={() => toggleFun('movies')} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={expandedFun.has('movies')}>
                                <h2 className={`${aboutSubsectionTitle} leading-tight`}>Movies that ground me</h2>
                                <span className={`shrink-0 font-mono text-sm text-emerald-500 transition-transform duration-200 ${expandedFun.has('movies') ? 'rotate-90' : ''}`} aria-hidden>&gt;</span>
                            </button>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedFun.has('movies') ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <a
                                        href="https://letterboxd.com/eqeen/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs leading-snug text-gray-300 transition-opacity hover:opacity-90"
                                    >
                                        <LetterboxdIcon className="h-6 w-6 shrink-0 text-[#00e054]" />
                                        <span className="text-blue-300 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-200">
                                            Letterboxd
                                        </span>
                                    </a>
                                    <ul className="mt-2 list-disc space-y-1 break-words pl-4 text-xs leading-snug text-gray-300">
                                        {favoriteMovies.map((title) => (
                                            <li key={title} className="marker:text-blue-300">
                                                <span className="font-medium text-gray-100">{title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className={funSubsectionBox}>
                            <button type="button" onClick={() => toggleFun('books')} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={expandedFun.has('books')}>
                                <h2 className={aboutSubsectionTitle}>Favorite books</h2>
                                <span className={`shrink-0 font-mono text-sm text-emerald-500 transition-transform duration-200 ${expandedFun.has('books') ? 'rotate-90' : ''}`} aria-hidden>&gt;</span>
                            </button>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedFun.has('books') ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <a
                                        href="https://www.goodreads.com/user/show/18083552-ekin-zorer"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-xs leading-snug text-gray-300 transition-opacity hover:opacity-90"
                                    >
                                        <GoodreadsIcon className="h-6 w-6 shrink-0 text-[#e9e5cd]" />
                                        <span className="text-blue-300 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-200">
                                            Goodreads
                                        </span>
                                    </a>
                                    <ul className="mt-3 list-disc space-y-1.5 break-words pl-4 text-xs leading-snug text-gray-300">
                                        {favoriteBooks.map((b) => (
                                            <li key={b.title} className="marker:text-blue-300">
                                                <span className="font-medium text-gray-100">{b.title}</span>
                                                <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{b.author}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className={funSubsectionBox}>
                            <button type="button" onClick={() => toggleFun('restaurants')} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={expandedFun.has('restaurants')}>
                                <h2 className={aboutSubsectionTitle}>Restaurants in my cities</h2>
                                <span className={`shrink-0 font-mono text-sm text-emerald-500 transition-transform duration-200 ${expandedFun.has('restaurants') ? 'rotate-90' : ''}`} aria-hidden>&gt;</span>
                            </button>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedFun.has('restaurants') ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <div className="mt-3 min-w-0 overflow-x-auto">
                                        <a
                                            href="https://www.instagram.com/plsfixenyc/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-max max-w-none flex-nowrap items-center gap-2 text-xs leading-snug text-gray-300 transition-opacity hover:opacity-90"
                                        >
                                            <InstagramIcon className="h-6 w-6 shrink-0 text-[#E4405F]" />
                                            <span className="text-blue-300 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-200">
                                                Instagram
                                            </span>
                                        </a>
                                    </div>
                                    <div className="mt-3 space-y-4">
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-200">London</h3>
                                            <p className="text-[11px] leading-snug text-gray-500">Lived ~1 year and still here!</p>
                                            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs leading-snug text-gray-300">
                                                <li className="marker:text-blue-300">OMA</li>
                                                <li className="marker:text-blue-300">Roti King</li>
                                                <li className="marker:text-blue-300">Rogues.</li>
                                                <li className="marker:text-blue-300">Speedboat Bar</li>
                                                <li className="marker:text-blue-300">King Cook Daily</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-200">New York City</h3>
                                            <p className="text-[11px] leading-snug text-gray-500">Lived ~4 years</p>
                                            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs leading-snug text-gray-300">
                                                <li className="marker:text-blue-300">Birds of a Feather</li>
                                                <li className="marker:text-blue-300">Kopitiam</li>
                                                <li className="marker:text-blue-300">The Noortwyck</li>
                                                <li className="marker:text-blue-300">I Sodi</li>
                                                <li className="marker:text-blue-300">Kiki&apos;s</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-200">Istanbul</h3>
                                            <p className="text-[11px] leading-snug text-gray-500">Born &amp; raised</p>
                                            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs leading-snug text-gray-300">
                                                <li className="marker:text-blue-300">Bayramoğlu</li>
                                                <li className="marker:text-blue-300">Karaköy Lokantası</li>
                                                <li className="marker:text-blue-300">Mükellef Karaköy</li>
                                                <li className="marker:text-blue-300">Mangerie</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={funSubsectionBox}>
                            <button type="button" onClick={() => toggleFun('music')} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={expandedFun.has('music')}>
                                <h2 className={aboutSubsectionTitle}>Current music obsession</h2>
                                <span className={`shrink-0 font-mono text-sm text-emerald-500 transition-transform duration-200 ${expandedFun.has('music') ? 'rotate-90' : ''}`} aria-hidden>&gt;</span>
                            </button>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedFun.has('music') ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <ul className="mt-3 list-disc space-y-1 break-words pl-4 text-xs leading-snug text-gray-300">
                                        {currentMusicObsession.map((name) => (
                                            <li key={name} className="marker:text-blue-300">
                                                <span className="font-medium text-gray-100">{name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                        </div>

                        <div className={`${aboutSubsectionBox} justify-center`}>
                            <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                                I recharge by consuming books, films and music, adventuring on mountains and participating in
                                team sports, only to claim the bare title of dilettante in each of them. Alas, I try and enjoy the imperfect process. Sharing
                                these with others is probably my favorite way to connect with new friends. I'd like to leave a scattered diary of my experiences on the
                                internet and perhaps it teaches models how to enjoy good movies some day. Also, it&apos;s good to touch grass when you are working in a hectic industry x)
                            </p>
                        </div>
                    </div>
                </section>

                <section id="contact" className="scroll-mt-36 mt-16 sm:scroll-mt-32">
                    <header className="mb-6">
                        <SectionHeading className={SECTION_LABEL_CLASS} showCursor={cursorTarget === 'heading' && activeHash === '#contact'}>Contact</SectionHeading>
                    </header>
                    <div className="border border-gray-700/70 bg-gray-900/40 p-6">
                        <p className="text-sm text-gray-300 sm:text-base">
                            You can reach out to me at{' '}
                            <a
                                href="mailto:zorerekin@gmail.com"
                                className="text-blue-300 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-200"
                            >
                                zorerekin@gmail.com
                            </a>{' '}
                            <span className="font-medium text-gray-200">only about AI safety please. </span>
                        </p>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-400 sm:text-base">💬 Advice & mentoring</h3>
                            <ul className="mt-2 list-none space-y-2.5 border-l border-emerald-500/25 pl-4 text-sm text-gray-300 sm:pl-5 sm:text-base" role="list">
                                <li className="flex gap-2.5">
                                    <span className="font-mono text-emerald-500/90" aria-hidden>
                                        &gt;
                                    </span>
                                    <span className="min-w-0 leading-relaxed">
                                        Happy to offer informal advice and mentoring for people looking to move into AI safety (especially women /
                                        non-binary peeps!) I can&apos;t promise a reply to every email but will try my best. I&apos;m also working on a
                                        blogpost about my transition to AI safety.
                                    </span>
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="font-mono text-emerald-500/90" aria-hidden>
                                        &gt;
                                    </span>
                                    <span className="min-w-0 leading-relaxed">
                                        I&apos;m no longer advising on quant recruiting as the field has changed a lot since I left, so my knowledge is
                                        outdated.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-5">
                            <h3 className="text-sm font-medium text-gray-400 sm:text-base">🤝 Collaboration</h3>
                            <ul className="mt-2 list-none space-y-2.5 border-l border-emerald-500/25 pl-4 text-sm text-gray-300 sm:pl-5 sm:text-base" role="list">
                                <li className="flex gap-2.5">
                                    <span className="font-mono text-emerald-500/90" aria-hidden>
                                        &gt;
                                    </span>
                                    <span className="min-w-0 leading-relaxed">
                                        Open to research collaborations when there&apos;s a good fit. See my{' '}
                                        <a
                                            href="https://twitter.com/ekinomicss"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-200"
                                        >
                                            Twitter
                                        </a>{' '}
                                        for what I&apos;m thinking about lately.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </StarClearZone>
        </main>
    )
}
