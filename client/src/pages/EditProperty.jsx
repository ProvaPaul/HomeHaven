import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import PropertyForm from '../components/property/PropertyForm';
import PageLoader from '../components/common/PageLoader';
import NotFound from './NotFound';
import { fetchProperty, updateProperty } from '../features/properties/propertyThunks';
import { selectCurrentProperty, clearCurrentProperty } from '../features/properties/propertiesSlice';
import { selectUser } from '../features/auth/authSlice';

export default function EditProperty() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { property, status } = useSelector(selectCurrentProperty);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchProperty(id));
    return () => dispatch(clearCurrentProperty());
  }, [dispatch, id]);

  if (status === 'loading' || status === 'idle') return <PageLoader />;
  if (status === 'failed' || !property) return <NotFound />;

  const isOwner = user && (property.owner?._id === user._id || user.role === 'admin');
  if (!isOwner) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Not your listing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">You can only edit properties you own.</p>
      </div>
    );
  }

  const handleSubmit = async (payload) => {
    const result = await dispatch(updateProperty({ id, ...payload }));
    if (updateProperty.fulfilled.match(result)) {
      toast.success('Listing updated!');
      navigate(`/properties/${id}`);
    } else {
      toast.error(result.payload || 'Could not update the listing');
    }
  };

  return (
    <div className="container-page max-w-4xl py-10 lg:py-14">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Listing</h1>
      <p className="mt-1.5 text-gray-600 dark:text-gray-400">{property.title}</p>
      <div className="mt-8">
        <PropertyForm property={property} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
