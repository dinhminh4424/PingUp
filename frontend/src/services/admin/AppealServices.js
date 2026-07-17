import api from "../../lib/axios";

export const getAppeals = async (
  searchQuery,
  targetModelFilter,
  appealTypeFilter,
  statusFilter,
  startDate,
  endDate,
  page = 1,
) => {
  console.log("searchQuery: ", searchQuery);
  console.log("targetModelFilter: ", targetModelFilter);
  console.log("appealTypeFilter: ", appealTypeFilter);
  console.log("statusFilter: ", statusFilter);
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);
  console.log("page: ", page);

  const res = await api.get(`/api/admin/appeal`, {
    params: {
      searchQuery,
      targetModelFilter,
      appealTypeFilter,
      statusFilter,
      startDate,
      endDate,
      page,
    },
  });
  return res.data;
};

export const resolveAppeal = async (id, status, result) => {
  const res = await api.put(`/api/admin/appeal/${id}/resolve`, {
    status,
    result,
  });
  return res.data;
};
