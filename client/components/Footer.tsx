'use client'
import React from 'react'
import { FaGooglePlay, FaApple } from "react-icons/fa";
const Footer = () => {
    const handlePlayStoreClick = () => {
        window.open("https://play.google.com/store/apps/details?id=com.internshala.android", "_blank");
    };

    const handleAppStoreClick = () => {
        window.open("https://apps.apple.com/app/id389801252", "_blank");
    };
    return (
        <>
            <div className='bg-gray-600 w-full h-100 bottom-0 lefo-0 right-0 relative text-white p-10 flex-wrap justify-between items-center'>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-col p-2 gap-2'>
                        <span> About us</span>
                        <span> We're hiring</span>
                        <span> Hire interns for your company</span>
                        <span> Post a Job</span>
                        <span> Competitions</span>
                    </div>
                    <div className='flex flex-col p-2 gap-2'>
                        <span> Team Diary</span>
                        <span> Blog</span>
                        <span> Our Services</span>
                    </div>
                    <div className='flex flex-col p-2 gap-2'>
                        <span> Terms & Conditions</span>
                        <span> Privacy</span>
                        <span> Contact us</span>
                        <span> Annual Returns</span>
                        <span> Grievance Redressal</span>
                    </div>
                    <div className='flex flex-col p-2 gap-2'>
                        <span>Sitemap</span>
                        <span>College TPO registration</span>
                        <span>List of Companies</span>
                    </div>
                </div>
                <div className='flex gap-5'>
                    <div className='bg-black w-fit p-2 rounded-2xl border-2 border-white' onClick={handlePlayStoreClick}> <FaGooglePlay /> <span>Google play</span></div>
                    <div className='bg-black w-fit p-2 rounded-2xl border-2 border-white' onClick={handleAppStoreClick}>  <FaApple /> <span>Apple store</span></div>
                </div>
                <div className='flex gap-5 p-2'  ><span>© Copyright 2026 Internshala</span>
                    <span>(Scholiverse Educare Private Limited
                        )</span>
                </div>
            </div>
        </>
    )
}

export default Footer