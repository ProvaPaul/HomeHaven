import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarDays, LogOut, Mail, Shield, User } from 'lucide-react';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { profileSchema } from '../lib/validations';
import { selectUser } from '../features/auth/authSlice';
import { logoutUser, updateProfile } from '../features/auth/authThunks';

export default function Profile() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name || '' },
  });

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) return null;

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="container-page py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-1.5 text-gray-600 dark:text-gray-400">
          Manage your account information and preferences.
        </p>

        {/* Overview card */}
        <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:p-8">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-3xl font-bold text-white">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600 dark:text-gray-400 sm:gap-1">
              <p className="flex items-center justify-center gap-2 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <p className="flex items-center justify-center gap-2 sm:justify-start">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="capitalize">{user.role} account</span>
              </p>
              <p className="flex items-center justify-center gap-2 sm:justify-start">
                <CalendarDays className="h-4 w-4 shrink-0" />
                Member since {joined}
              </p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Account Details
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5" noValidate>
            <Input
              label="Full Name"
              name="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input value={user.email} disabled className="input-field cursor-not-allowed opacity-60" />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Email address cannot be changed.
              </p>
            </div>
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-500/20 dark:bg-red-500/5 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Log out of your account</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              You'll need to log in again to access your profile.
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
