import { motion } from 'framer-motion';
import { Award, Heart, Lightbulb, Target } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const values = [
  {
    icon: Heart,
    title: 'People First',
    description:
      'Buying a home is personal. We treat every customer like family and every home like our own.',
  },
  {
    icon: Target,
    title: 'Transparency',
    description:
      'No hidden fees, no fine print games. Clear pricing and honest information at every step.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We use modern technology to remove friction from one of life\'s biggest decisions.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'From listings to support, we hold ourselves to the highest standard in the industry.',
  },
];

const team = [
  { name: 'Sarah Mitchell', role: 'CEO & Co-founder' },
  { name: 'David Chen', role: 'CTO & Co-founder' },
  { name: 'Amara Okafor', role: 'Head of Design' },
  { name: 'James Rodriguez', role: 'Head of Operations' },
];

export default function About() {
  usePageTitle('About Us');
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container-page py-16 text-center lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              About HomeHaven
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              We're on a mission to make finding a home as joyful as living in one. Since 2020,
              we've helped thousands of families across the country find the place they belong.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-gray-600 dark:text-gray-400">
              <p>
                HomeHaven started with a simple frustration: finding a home was harder than it
                needed to be. Endless phone calls, outdated listings, and paperwork that never
                seemed to end.
              </p>
              <p>
                So we built something better — a platform where every listing is verified, every
                agent is vetted, and every step from search to keys-in-hand is designed around you.
              </p>
              <p>
                Today, HomeHaven serves over 120 cities with more than 12,000 active listings, and
                we're just getting started.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['2020', 'Founded'],
              ['12k+', 'Active listings'],
              ['8k+', 'Homes matched'],
              ['98%', 'Customer satisfaction'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{value}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="container-page py-16 lg:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What We Stand For</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
              Four values guide every decision we make.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <value.icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-page py-16 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meet the Team</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
            The people building the future of home search.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-bold text-white">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
