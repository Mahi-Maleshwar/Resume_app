import React from 'react'
import AppHeader from './_components/AppHeader'

function Dashboardlayout({children} : any) {
  return (
    <div>
        <AppHeader />
        {children}</div>
  )
}

export default Dashboardlayout