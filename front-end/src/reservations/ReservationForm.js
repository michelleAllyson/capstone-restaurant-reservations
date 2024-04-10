import React from "react";
import { useHistory } from "react-router-dom";

export const ReservationForm = ({ reservation, handleChange, handleSubmit}) => {

    const history = useHistory();
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="first_name">First Name:</label>
                    <input 
                        type="text" 
                        name="first_name" 
                        placeholder="First Name"  
                        required={true}
                        value={reservation.first_name}
                        onChange={handleChange}    
                    />
                </div>
                <div>
                    <label htmlFor="last_name">Last Name:</label>
                    <input 
                        type="text" 
                        name="last_name" 
                        placeholder="Last Name"
                        required={true}
                        value={reservation.last_name}
                        onChange={handleChange}    
                    />
                </div>
                <div>
                    <label htmlFor="mobile_number">Mobile Number:</label>
                    <input 
                        type="text" 
                        name="mobile_number" 
                        placeholder="Mobile Number"
                        required={true}
                        value={reservation.mobile_number}
                        onChange={handleChange}    
                    />
                </div>
                <div>
                    <label htmlFor="reservation_date">Reservation Date:</label>
                    <input 
                        type="date" 
                        name="reservation_date" 
                        placeholder="YYYY-MM-DD" 
                        pattern="\d{4}-\d{2}-\d{2}"
                        required={true}
                        value={reservation.reservation_date}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="reservation_time">Reservation Time:</label>
                    <input 
                        type="time" 
                        name="reservation_time" 
                        placeholder="HH:MM" 
                        pattern="[0-9]{2}:[0-9]{2}"  
                        required={true}
                        value={reservation.reservation_time}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="people">Number of People:</label>
                    <input 
                        type="number" 
                        name="people" 
                        placeholder="Number of People"
                        required={true}
                        value={reservation.people}
                        min={1}
                        onChange={handleChange}    
                    />
                </div>
                <div>
                    <button 
                        type="submit"
                        className="btn btn-primary"
                        >
                            Submit
                        </button>
                    <button 
                        className="btn btn-danger"
                        type="button"
                        onClick={() => history.goBack()}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )

}

export default ReservationForm;