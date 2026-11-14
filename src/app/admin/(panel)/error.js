'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="empty-state">
      <h2>Couldn’t load this page</h2>
      <p>
        The database or file storage may be unreachable. Check the MONGODB_URI setting and your internet connection, then try again.
      </p>
      <button className="ab ab-dark" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
