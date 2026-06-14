'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
function Applications() {
    const route = useRouter()
    return (

        <div>
            <button onClick={()=>route.push('/adminpanel')}>Back</button>
            Applications
        </div>
    )
}

export default Applications