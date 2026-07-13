'use client'
import React from 'react'
import { FaGooglePlay, FaApple } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext"; // 🌍 1. Import your global i18n hook

const Footer = () => {
    // 🌍 2. Initialize the translation core right here
    const { t } = useLanguage();

    const handlePlayStoreClick = () => {
        window.open("https://play.google.com/store/apps/details?id=com.internshala.android", "_blank");
    };

    const handleAppStoreClick = () => {
        window.open("https://apps.apple.com/app/id389801252", "_blank");
    };

    return (
        <div className='bg-gray-600 w-full left-0 right-0 relative text-white px-6 py-10 sm:p-10'>
            {/* FIX: was `flex flex-row justify-between` with a fixed `h-100` on the
                outer wrapper — on narrow screens this squeezed 4 columns into one
                unwrappable row and often clipped content against the fixed height.
                Grid + column count that scales with screen width fixes both. */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8'>

                {/* Column 1 */}
                <div className='flex flex-col gap-2 text-sm'>
                    <span>{t('footer.aboutUs') || "About us"}</span>
                    <span>{t('footer.weAreHiring') || "We're hiring"}</span>
                    <span>{t('footer.hireInterns') || "Hire interns for your company"}</span>
                    <span>{t('footer.postAJob') || "Post a Job"}</span>
                    <span>{t('footer.competitions') || "Competitions"}</span>
                </div>

                {/* Column 2 */}
                <div className='flex flex-col gap-2 text-sm'>
                    <span>{t('footer.teamDiary') || "Team Diary"}</span>
                    <span>{t('footer.blog') || "Blog"}</span>
                    <span>{t('footer.ourServices') || "Our Services"}</span>
                </div>

                {/* Column 3 */}
                <div className='flex flex-col gap-2 text-sm'>
                    <span>{t('footer.terms') || "Terms & Conditions"}</span>
                    <span>{t('footer.privacy') || "Privacy"}</span>
                    <span>{t('footer.contactUs') || "Contact us"}</span>
                    <span>{t('footer.annualReturns') || "Annual Returns"}</span>
                    <span>{t('footer.grievance') || "Grievance Redressal"}</span>
                </div>

                {/* Column 4 */}
                <div className='flex flex-col gap-2 text-sm'>
                    <span>{t('footer.sitemap') || "Sitemap"}</span>
                    <span>{t('footer.tpoRegistration') || "College TPO registration"}</span>
                    <span>{t('footer.companyList') || "List of Companies"}</span>
                </div>
            </div>

            {/* App Links Block — stacks on mobile, side by side from sm up */}
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-5 mt-8'>
                <div
                    className='bg-black w-full sm:w-fit p-2 rounded-2xl border-2 border-white cursor-pointer flex items-center justify-center sm:justify-start gap-2'
                    onClick={handlePlayStoreClick}
                >
                    <FaGooglePlay /> <span>{t('footer.googlePlay') || "Google play"}</span>
                </div>
                <div
                    className='bg-black w-full sm:w-fit p-2 rounded-2xl border-2 border-white cursor-pointer flex items-center justify-center sm:justify-start gap-2'
                    onClick={handleAppStoreClick}
                >
                    <FaApple /> <span>{t('footer.appleStore') || "Apple store"}</span>
                </div>
            </div>

            {/* Copyright Line — stacks on mobile so it doesn't get clipped */}
            <div className='flex flex-col sm:flex-row gap-1 sm:gap-5 mt-6 text-xs text-gray-300'>
                <span>{t('footer.copyright') || "© Copyright 2026 Internshala"}</span>
                <span>{t('footer.companyName') || "(Educare Private Limited)"}</span>
                <span>- Saans Danvexy</span>
            </div>
        </div>
    )
}

export default Footer;