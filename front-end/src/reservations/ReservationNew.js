import React from "react";
import ReservationError from "./ReservationError";
import ReservationForm from "./ReservationForm";
import { createReservation } from "../utils/api";
import { useHistory } from "react-router-dom";
import { today } from "../utils/date-time";
import { useState } from "react";

function ReservationNew () {

    const history = useHistory();

    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: today(),
        reservation_time: "",
        people: 0,
    };

    const [reservation, setReservation] = useState({ ...initialFormState });
    const [errors, setErrors] = useState(null);

    const handleChange = ({ target }) => {
        setReservation({
            ...reservation,
            [target.name]: target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        try {
            const response = await createReservation(reservation, abortController.signal);
            history.push(`/dashboard?date=${reservation.reservation_date}`);
            return response;
        } catch (error) {
            setErrors([error]);
        }
    };

    return (
        <div>
            <h1>New Reservation</h1>
            <ReservationError errors={errors} />
            <ReservationForm reservation={reservation} handleChange={handleChange} handleSubmit={handleSubmit} />
        </div>
    );

}

export default ReservationNew;