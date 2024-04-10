import React from "react";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationError({ errors }) {
    if (!errors || errors.length === 0) return null;
    return (
      <div>
        <h1>Reservation Error</h1>
        <p>An error occurred:</p>
        <ErrorAlert error={errors[0]} />
      </div>
    );
  }
  
  export default ReservationError;
  