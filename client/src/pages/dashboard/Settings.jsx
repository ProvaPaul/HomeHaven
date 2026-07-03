import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { KeyRound, Moon, Sun, UserCog } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../lib/axios';
import { profileSchema } from '../../lib/validations';
import { selectUser } from '../../features/auth/authSlice';
import { updateProfile } from '../../features/auth/authThunks';
import { useTheme } from '../../providers/ThemeProvider';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain a letter')
      .regex(/\d/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const cardClass = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8';

export default function Settings() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated');
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, security, and preferences." />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <section className={cardClass}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <UserCog className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Profile
          </h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-5 space-y-5" noValidate>
            <Input
              label="Full Name"
              name="name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input value={user?.email || ''} disabled className="input-field cursor-not-allowed opacity-60" />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Email address cannot be changed.</p>
            </div>
            <Button
              type="submit"
              isLoading={profileForm.formState.isSubmitting}
              disabled={!profileForm.formState.isDirty}
            >
              Save Changes
            </Button>
          </form>
        </section>

        {/* Security */}
        <section className={cardClass}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <KeyRound className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Security
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Use a strong password you don't reuse on other sites.
          </p>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-5 space-y-5" noValidate>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>
            <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>
              Change Password
            </Button>
          </form>
        </section>

        {/* Appearance */}
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose how HomeHaven looks for you.</p>
          <div className="mt-4 flex gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  theme === option.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
