import { Link } from 'react-router-dom';
import { Facebook, Home, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Careers', to: '/about' },
  ],
  Explore: [
    { label: 'Buy a Home', to: '/properties?status=for-sale' },
    { label: 'Rent a Home', to: '/properties?status=for-rent' },
    { label: 'Sell a Home', to: '/properties/new' },
    { label: 'Compare', to: '/compare' },
  ],
  Support: [
    { label: 'Help Center', to: '/contact' },
    { label: 'Privacy Policy', to: '/about' },
    { label: 'Terms of Service', to: '/about' },
  ],
};

const socials = [
  { Icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Home className="h-[18px] w-[18px]" />
              </span>
              HomeHaven
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Your trusted partner in finding the perfect home. Browse thousands of listings, connect
              with verified agents, and move in with confidence.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                123 Haven Street, Suite 400, San Francisco, CA
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary-600" />
                +1 (555) 123-4567
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary-600" />
                hello@homehaven.com
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                {title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} HomeHaven. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
