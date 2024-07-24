'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const Card = ({
    id,
    name,
    _count: { reports },

}) => {

    const router = useRouter()

    return (
        <div onClick={() => router.push(`/reports/users/${id}?officer=${name}`)} className='border shadow-lg hover:scale-[1.03] duration-200 text-[#111] flex flex-col items-center gap-3 rounded-sm cursor-pointer p-4'>
            <h1 className='font-medium text-2xl'>{name}</h1>
            <h3>عدد التقارير: {reports}</h3>
        </div>
    )
}

export default Card