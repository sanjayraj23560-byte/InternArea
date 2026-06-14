"use client";
import axios from "axios";
const Feedback = () => {
  const Demo = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}demo`);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      
      <h1>Feedback</h1>

      <button
        onClick={Demo}
        className="bg-blue-500 text-white p-2 rounded">
        Click Me
      </button>

    </div>
  );
};

export default Feedback;