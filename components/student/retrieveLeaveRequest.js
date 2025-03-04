import axios from "axios";

export const retrieveLeaveRequest = async (
    user,
    selectedDate,
    setGetSaLeaveRequests
) => {
    try {
        const url =
            "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

        const formattedDate = selectedDate
            ? `${selectedDate.getFullYear()}-${String(
                selectedDate.getMonth() + 1
            ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
            : null;

        const jsondata = {
            saId: user.user_id,
            date: formattedDate,
        };

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify(jsondata),
                operation: "displayLeaveRequest",
            },
        });

        setGetSaLeaveRequests(response.data);
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
    }
};