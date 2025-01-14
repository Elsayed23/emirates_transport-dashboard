'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Card from './_components/Card'
import DynamicBreadcrumb from '@/app/(dashboard)/_components/DynamicBreadcrumb'
import useTranslation from '@/app/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Loading from '@/app/(dashboard)/_components/Loading'
import { useAuth } from '@/app/context/AuthContext'

const Page = () => {

    const [officersData, setOfficersData] = useState(null)
    const [loading, setLoading] = useState(true)

    const { user } = useAuth()

    const officerCard = officersData?.map((card, idx) => {
        return (
            <Card key={idx} {...card} />
        )
    })

    const getOfficers = async () => {
        try {
            if (user) {
                const { data } = await axios.get('/api/safety_officer')

                // If the role is 'SAFETY_DIRECTOR', filter and count only approved reports
                const processedData = data.map(officer => {
                    const approvedReportsCount = officer.reports.filter(report => report.approved).length;
                    return {
                        ...officer,
                        _count: {
                            reports: user?.role?.name === 'SAFETY_DIRECTOR' ? approvedReportsCount : officer._count.reports
                        }
                    }
                })

                console.log(data, processedData);

                setOfficersData(processedData)
                setLoading(false)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getOfficers()
    }, [user])

    const { t } = useTranslation()
    const router = useRouter()

    const breadcrumbData = [
        {
            title: t('Safety officers')
        },
    ]

    if (loading) return <Loading />

    return (
        <div className="p-6 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-9">
                <DynamicBreadcrumb routes={breadcrumbData} />
                <div className="flex flex-col gap-3">
                    <h2 className='text-xl font-medium'>{t('Number of safety officers')}: {officersData?.length}</h2>
                    <hr />
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {officerCard}
                </div>
            </div>
        </div>
    )
}

export default Page
