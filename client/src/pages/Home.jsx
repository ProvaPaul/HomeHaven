import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Home as HomeIcon,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const stats = [
  { value: '12k+', label: 'Properties Listed' },
  { value: '8k+', label: 'Happy Customers' },
  { value: '500+', label: 'Verified Agents' },
  { value: '120+', label: 'Cities Covered' },
];

const features = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Filter by location, price, amenities and more to find exactly what you need.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every property is vetted by our team so you can browse with total confidence.',
  },
  {
    icon: Users,
    title: 'Trusted Agents',
    description: 'Work with experienced, background-checked agents who know your market.',
  },
  {
    icon: KeyRound,
    title: 'Easy Move-in',
    description: 'From offer to keys in hand — we streamline paperwork and closing for you.',
  },
];

const categories = [
  { icon: HomeIcon, title: 'Houses', count: '4,200+ listings' },
  { icon: Building2, title: 'Apartments', count: '6,800+ listings' },
  { icon: MapPin, title: 'Land & Plots', count: '1,100+ listings' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container-page flex flex-col items-center py-20 text-center lg:py-28">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300"
          >
            <Sparkles className="h-4 w-4" />
            The modern way to find your home
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Find a place you'll{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              love to live
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-400"
          >
            HomeHaven connects you with thousands of verified properties and trusted agents. Buy,
            rent, or sell — all in one beautifully simple platform.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-primary-600/25 transition hover:bg-primary-700"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
            Whatever you're looking for, we have a home for it.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
              className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/40"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-400">
                <cat.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{cat.count}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="container-page py-16 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why HomeHaven?</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
              We make finding and moving into your next home simple, safe, and even enjoyable.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={i}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <feature.icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-16 text-center shadow-xl sm:px-16">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to find your dream home?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
              Create a free account today and start exploring thousands of verified listings.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-md transition hover:bg-primary-50"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
