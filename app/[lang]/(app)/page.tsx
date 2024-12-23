'use client'
import { getAllWorkSpaces } from '@/api/workSpace'
import { useEffect } from 'react'

function HomePage() {
    useEffect(() => {
        (async () => {
            const rs = await getAllWorkSpaces('owner')
            console.log(rs)
        })()
    })

    return (
        <div>
            <h1>HomePage</h1>
        </div>
    )
}

export default HomePage