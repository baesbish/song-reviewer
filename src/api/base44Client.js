const API_URL = "http://localhost:3001";

// Helper for requests
const request = async (url, options = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
};

// Fake base44 replacement
export const base44 = {
  auth: {
    me: async () => {
      return { id: 1, name: "Demo User" };
    },
    logout: () => {},
    redirectToLogin: () => {},
  },

  entities: {
    Album: {
      filter: async (query) => {
        const params = new URLSearchParams(query).toString();
        return request(`/albums?${params}`);
      },
      create: async (data) => {
        return request(`/albums`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id, data) => {
        return request(`/albums/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
    },

    TrackReview: {
      filter: async (query) => {
        const params = new URLSearchParams(query).toString();
        return request(`/reviews?${params}`);
      },
      create: async (data) => {
        return request(`/reviews`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id, data) => {
        return request(`/reviews/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
    },
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // TEMP: fake upload
        return {
          file_url: URL.createObjectURL(file),
        };
      },
    },
  },
};