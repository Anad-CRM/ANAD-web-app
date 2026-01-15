"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary">
        Dashboard
      </h1>

      {user && (
        <div className="mt-4 rounded-lg bg-white p-4 shadow">
          <p>
            <strong>Name:</strong> {user.userName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}
    </div>
  );
}
