import React from 'react'

import logo from "../assets/logo_hearthstone.png"
import "./ButtonStart.css"


export default function ButtonStart(props) {  
  const { action } = props

  return (
    <button className="btStart" onClick={action}>
      <img alt="" src={logo} />
      START GAME            
    </button>  
  )  
}


