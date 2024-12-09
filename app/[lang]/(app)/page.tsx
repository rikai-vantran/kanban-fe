'use client'
import { getAllWorkSpaces } from '@/api/workSpace'
import { useAuth } from '@/contexts/Auth/AuthProvider'
import { Button } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function App() {
    const router = useRouter()
    const pathName = usePathname();
    const lang = pathName.split('/')[1];
    const {
        signOut
    } = useAuth()
    useEffect(() => {
        (async () => {
            const rs = await getAllWorkSpaces('owner')
            console.log(rs)
        })()
    })
    return (
        <div>
            <h1>App</h1>
            <Button type="primary"
                onClick={async () => {
                    await signOut()
                    router.push(`${lang}/login`)
                }}
            >Logout</Button>
        </div>
    )
}

export default App