import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useProjects } from '../context/ProjectContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { 
  ShieldCheck, 
  Zap, 
  FileCheck, 
  ArrowRight, 
  ChevronDown, 
  HelpCircle, 
  CheckCircle2, 
  UserCheck, 
  Coins 
} from 'lucide-react';

export function LandingPage() {
  const { projects, applications } = useProjects();
  const openProjects = projects.filter((p) => p.status === 'OPEN');
  
  // State for FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden py-32 text-center lg:py-40">
          {/* Subtle Background Image / Watermark Effect */}
          <div className="absolute inset-0 bg-[url('../assets/image1.jpg')] bg-cover bg-center opacity-[0.26] pointer-events-none" />
          
          <div className="container-shell relative z-10">
            <p className="section-label inline-flex items-center rounded-full bg-slate-100 px-3 py-1 mb-4">
             
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Trustless Freelance.<br />
              <span className="text-[color:var(--brand-blue)]">Guaranteed Payments.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Lock payments safely in escrow, collaborate with peace of mind, and instantly generate verifiable digital receipts when the job is done. 
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Link to="/onboard" className="btn-primary flex items-center gap-2 group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#marketplace" className="btn-secondary">
                View Marketplace
              </a>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM & SOLUTION SECTION */}
        <section className="bg-slate-50 py-24">
          <div className="container-shell">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="section-label">The Problem</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Remote work lacks trust.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Freelancers fear unpaid invoices after weeks of work, while clients worry about upfront deposits disappearing. Traditional platforms bridge this by charging massive 20% platform fees.
                </p>
              </div>
              <div className="surface-card p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900 mb-5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">The SkillReceipt Solution</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We automate the trust. Funds are held in a secure escrow system and release automatically upon mutual approval. No massive middlemen fees, just clean, guaranteed transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES (BENTO GRID STYLE) */}
        <section id="features" className="py-24">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to work securely.</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="surface-card p-8 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-900 mb-6">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Verifiable Resumes</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Every paid milestone generates a digital SkillReceipt. Freelancers can use these to build an un-fakeable portfolio of completed work.
                  </p>
                </div>
              </div>

              <div className="surface-card p-8 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-900 mb-6">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Automated Escrow</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your money isn't held by arbitrary admins. Our automated escrow locks the funds and only releases them when project conditions are met.
                  </p>
                </div>
              </div>

              <div className="surface-card p-8 flex flex-col justify-between bg-slate-50/50 sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-900 mb-6">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Clear Milestones</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Simple dashboards guide both clients and freelancers through funding, work submission, and final payment without the guesswork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section id="how-it-works" className="bg-slate-50 py-24">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built for both sides of the contract.</h2>
            </div>
            
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Client Architecture */}
              <div className="surface-card p-8">
                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 mb-6">
                  Client Journey
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Define the project</h4>
                      <p className="mt-1 text-xs text-slate-600">Create a job post with a clear scope of work and a set budget.</p>
                    </div>
                  </li>
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Fund the escrow</h4>
                      <p className="mt-1 text-xs text-slate-600">Lock the payment safely upfront so the freelancer knows you are serious.</p>
                    </div>
                  </li>
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">3</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Approve & Release</h4>
                      <p className="mt-1 text-xs text-slate-600">Review the final deliverables. Once approved, payment transfers instantly.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Freelancer Architecture */}
              <div className="surface-card p-8">
                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 mb-6">
                  Freelancer Journey
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-900">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Verify funding</h4>
                      <p className="mt-1 text-xs text-slate-600">Accept jobs knowing the money is already secured in the platform's escrow.</p>
                    </div>
                  </li>
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-900">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Submit the work</h4>
                      <p className="mt-1 text-xs text-slate-600">Upload your deliverables directly through your project dashboard.</p>
                    </div>
                  </li>
                  <li className="flex gap-x-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-900">3</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Get paid & get proof</h4>
                      <p className="mt-1 text-xs text-slate-600">Receive payment instantly alongside a digital SkillReceipt for your portfolio.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BENEFITS */}
        <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
          <div className="container-shell relative z-10">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A better way to do business.</h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div className="surface-card bg-slate-800/50 p-6 border-slate-700/50 text-white">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white mb-4">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold tracking-tight">Ultra-Low Fees</div>
                <div className="mt-2 text-sm text-slate-300">Keep more of what you earn. We don't take massive cuts of your hard work.</div>
              </div>
              <div className="surface-card bg-slate-800/50 p-6 border-slate-700/50 text-white">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold tracking-tight">Instant Payouts</div>
                <div className="mt-2 text-sm text-slate-300">No waiting weeks for invoices to clear. Once approved, the transfer is immediate.</div>
              </div>
              <div className="surface-card bg-slate-800/50 p-6 border-slate-700/50 text-white">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white mb-4">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold tracking-tight">Direct Relationships</div>
                <div className="mt-2 text-sm text-slate-300">Work directly with your clients or talent without rigid middlemen getting in the way.</div>
              </div>
            </div>
          </div>
        </section>

        {/* MARKETPLACE SECTION */}
        <section id="marketplace" className="py-24">
          <div className="container-shell">
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <p className="section-label">Open projects</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Live marketplace</h2>
              </div>
              <Link to="/projects" className="btn-ghost flex items-center gap-1">
                View all projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {openProjects.length === 0 ? (
              <EmptyState
                title="No open projects yet"
                description="Be the first to publish a project. Get started to create a secure job post."
                actionLabel="Get started"
                actionTo="/onboard"
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {openProjects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    applicationCount={applications.filter((a) => a.projectId === project.id).length}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <section id="faq" className="bg-slate-50 py-24">
          <div className="container-shell max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "How is my money actually protected?",
                  a: "When a client funds a project, the money is locked in an automated digital escrow. SkillReceipt does not hold the funds in a traditional bank account where we could restrict access. The code ensures the money can only be released to the freelancer upon approval, or refunded to the client if the project is cancelled."
                },
                {
                  q: "What is a SkillReceipt?",
                  a: "A SkillReceipt is a permanent, verifiable digital certificate. Instead of just adding a line to your resume, a SkillReceipt proves cryptographically that you completed a specific project for a specific client and were successfully paid for it. It's the ultimate proof of experience."
                },
                {
                  q: "What happens if there is a disagreement?",
                  a: "Because the project scope and funds are locked upfront, the expectations are clear. If work isn't delivered, the funds are safely returned to the client. If work is delivered, the system guarantees the freelancer's payout."
                }
              ].map((faq, idx) => (
                <div key={idx} className="surface-card p-6">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between text-left font-semibold text-slate-900"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <p className="mt-4 text-sm leading-6 text-slate-600 pl-6 border-l border-slate-100">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA SECTION */}
        <section className="py-24 sm:py-32">
          <div className="container-shell">
            <div className="surface-card bg-slate-50 relative isolate overflow-hidden px-6 py-24 text-center sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ready to work with absolute confidence?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-6 text-slate-600">
                Whether you are hiring top talent or looking for your next gig, SkillReceipt guarantees a secure, seamless payment experience.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/onboard" className="btn-primary px-8 py-3.5">
                  Start your first project
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 text-sm text-slate-600">
        <div className="container-shell py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Platform</h3>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a></li>
                <li><a href="#marketplace" className="hover:text-slate-900 transition-colors">Marketplace</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/help" className="hover:text-slate-900 transition-colors">Help Center</Link></li>
                <li><Link to="/blog" className="hover:text-slate-900 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li><Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Contact</h3>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-500">support@skillreceipt.com</li>
                <li className="text-slate-500">Contact Sales</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} SkillReceipt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}