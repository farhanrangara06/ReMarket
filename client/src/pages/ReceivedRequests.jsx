import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import {
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
} from '../services/requestService';
import RequestCard from '../components/requests/RequestCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { REQUEST_STATUS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const ReceivedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page };
      if (statusFilter) params.status = statusFilter;
      const { data, pagination: pag } = await getReceivedRequests(params);
      setRequests(data);
      setPagination(pag);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load requests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleAction = async (action, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActionLoading(true);
    try {
      await action(id);
      fetchRequests(pagination.page);
    } catch (err) {
      setError(getErrorMessage(err, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Inbox className="w-7 h-7 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Received Requests</h1>
          <p className="text-gray-600 text-sm">Purchase requests from buyers for your products</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {REQUEST_STATUS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200 mb-4">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests received yet"
          description="When buyers send purchase requests for your products, they'll appear here."
        />
      ) : (
        <>
          <div className="space-y-4">
            {requests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                type="received"
                onAccept={(id) => handleAction(acceptRequest, id, 'Accept this purchase request?')}
                onReject={(id) => handleAction(rejectRequest, id, 'Reject this purchase request?')}
                onComplete={(id) => handleAction(completeRequest, id, 'Mark this transaction as completed? The product will be marked as sold.')}
                actionLoading={actionLoading}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={fetchRequests}
          />
        </>
      )}
    </div>
  );
};

export default ReceivedRequests;
