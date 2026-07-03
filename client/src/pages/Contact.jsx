import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { contactSchema } from '../lib/validations';
import { cn } from '../lib/utils';

const contactInfo = [
  { icon: MapPin, title: 'Office', lines: ['123 Haven Street, Suite 400', 'San Francisco, CA 94103'] },
  { icon: Phone, title: 'Phone', lines: ['+1 (555) 123-4567', 'Mon–Fri, 9am–6pm PT'] },
  { icon: Mail, title: 'Email', lines: ['hello@homehaven.com', 'support@homehaven.com'] },
  { icon: Clock, title: 'Hours', lines: ['Monday–Friday: 9am–6pm', 'Saturday: 10am–4pm'] },
];

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data) => {
    // Simulate a send — wire up to a /api/contact endpoint when available
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('Contact form submitted:', data);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    reset();
  };

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container-page py-16 text-center lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Questions about a listing, partnership, or anything else? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-2">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  {item.lines.map((line) => (
                    <p key={line} className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8 lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send us a message</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fill out the form and our team will respond within 24 hours.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Jane Doe"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <Input
                label="Subject"
                name="subject"
                placeholder="How can we help?"
                error={errors.subject?.message}
                {...register('subject')}
              />
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us more about your inquiry…"
                  className={cn('input-field resize-none', errors.message && 'input-error')}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
