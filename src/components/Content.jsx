import React, { useEffect, useState } from "react"

import ButtonStart from "../components/ButtonStart"

import api from "../services/api"
import apiKey from "../config/auth"

import "./Content.css"

import poster1 from "../assets/poster1.jpg"
import poster2 from "../assets/poster2.jpg"
import poster3 from "../assets/poster3.jpg"
import poster4 from "../assets/poster4.jpg"
import poster5 from "../assets/poster5.jpg"
import poster6 from "../assets/poster6.jpg"
import poster7 from "../assets/poster7.jpg"
import loadingAnimation from "../assets/loading.gif"

export default function Content() {
  const [cardsScreen, setCardsScreen] = useState([])
  const [cards, setCards] = useState([])
  const [cardBacks, setCardBacks] = useState([])
  const [cardCompare, setCardCompare] = useState([])
  const [showButtonStart, setShowButtonStart] = useState(true)
  const [cardBlocked, setCardBlocked] = useState([]) 
  const [cardsFlipped, setCardsFlipped] = useState([]) 
  const [loading, setLoading] = useState(true)

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  async function handleGetApi(query) {
    const { url, access_token, page, locale } = query
    return await api.get(
      `${url}?access_token=${access_token}&page=${page}&locale=${locale}`
    )
  }

  useEffect(() => {
    const background = [poster1, poster2, poster3, poster4, poster5, poster6, poster7]      
    const backgroundChoice = background[Math.floor(Math.random() * background.length)];    

    document.body.style.backgroundImage = `url(${backgroundChoice})`
  },[])

  function handleStart() {    
    setShowButtonStart(false)     
    
    console.log(cards)
    setCardBlocked(cardsFlipped)


    setCardsScreen(cards)

    setTimeout(() => {
      setCardsScreen(cardBacks)
    }, 5000)
  }

  function handleFlipCard(event) {        
    const cardPosition = Number(event.currentTarget.id)

    const cardClicked = {
      id: cards[cardPosition].id,
      cardPosition,      
      image: cards[cardPosition].image,
      imageBack: cardBacks[cardPosition].image,
    }
    setCardsFlipped([...cardsFlipped, cardPosition])

    setCardCompare([...cardCompare, cardClicked]) 

    cardsScreen[cardPosition] = cardClicked

    setCardsScreen(cardsScreen)
  }

  useEffect(() => {
    //console.log('CARDSFLIPPED', cardsFlipped)

    if (cardCompare.length === 1) {
      setCardBlocked(cardsFlipped)
    }

    if (cardCompare.length === 2) {                
      const cardPositions = cardsScreen.map((card, index) => index)      

      setCardBlocked(cardPositions) 

      const pos0 = Number(cardCompare[0].cardPosition)
      const pos1 = Number(cardCompare[1].cardPosition)
      
      if (cardCompare[0].id !== cardCompare[1].id) {  
        const cardsList = cardsScreen.map((card) => card)

        setTimeout(() => {
          cardsList[pos0].image = cardCompare[0].imageBack
          cardsList[pos1].image = cardCompare[1].imageBack

          setCardsScreen(cardsList)  
                    
          const a = cardsFlipped.filter(card => card !== pos0 && card !== pos1)          

          setCardsFlipped(a)          
          setCardBlocked(a)          
        }, 2000)
      } else { //Match!                      
        setCardBlocked([])
        setCardBlocked(cardsFlipped)        
      }
         
      setCardCompare([])      
    }

  }, [cardCompare, cardsFlipped, cardsScreen]) 

  useEffect(() => {   
    async function getCardBacks(query) {
      //Bate na api para pegar quantidade de páginas e cardBacks (exceto quantidade de cards da última página)
      const apiData = await handleGetApi(query)
      const pageCount = apiData.data.pageCount - 1      
      
      //Bate na api mais uma vez, agora escolhendo uma página aleatória e cardBacks aleatórios
      const pageRandom = Math.floor(Math.random() * pageCount) + 1
      query.page = pageRandom
      const apiDataFinal = await handleGetApi(query)
      const cardBacksCount = apiDataFinal.data.cardBacks.length

      //CardBacks aleatórios considerando também a última página (que pode possuir menos cardBacks que as demais páginas)
      const cardBacksRandom = Math.floor(Math.random() * cardBacksCount)
          
      const cardBacks = []

      // Compondo array de cardBacks
      for (let i = 0; i < 18; i++) {
        cardBacks[i] = apiDataFinal.data.cardBacks[cardBacksRandom]
      }
      
      setCardBacks(cardBacks)
    }
    const queryCardBacks = {
      url: 'cardbacks',
      access_token: apiKey,
      page: 1,
      locale: 'pt_BR'
    }    
    getCardBacks(queryCardBacks)    

    async function getCards(query) {
      //Bate na api para pegar quantidade de páginas 
      const apiData = await handleGetApi(query)
      const pageCount = apiData.data.pageCount - 1

      //Bate na api mais uma vez, agora escolhendo uma página aleatória e cards aleatórios
      const pageRandom = Math.floor(Math.random() * pageCount) + 1
      query.page = pageRandom
      const apiDataFinal = await handleGetApi(query)
      const cardsCount = apiDataFinal.data.cards.length
  
      let cardsRandom
      const cardExists = []
      const data = []

      // Compondo array de cards aleatórios
      for (let i = 0; i < 9; i++) {
        cardsRandom = Math.floor(Math.random() * cardsCount)            

        if (cardExists.includes(cardsRandom)) {           
          i = i - 1
        } else {
          cardExists[i] = cardsRandom
          data[i] = apiDataFinal.data.cards[cardsRandom]
        }            
      }

      const cards = [...data, ...data]

      shuffle(cards)
      setCards(cards)
      setLoading(false) 
    }

    const queryCards = {
      url: "cards",
      access_token: apiKey,
      page: 1,
      locale: 'pt_BR'
    }
    getCards(queryCards)     

  }, [])

  return (
    <>            
      <div className="cards">                
        {                     
          loading           
          ? <img alt="" src={loadingAnimation} className="loading" width="100%" height="100%" />          
          : showButtonStart 
            ? <ButtonStart action={handleStart} />      
            : null            
        }
        <ul className="cards__list">
          {cardsScreen.map((cardScreen, index) => (
            <li className="cards__item" key={index}>
              <button className="btCard" onClick={handleFlipCard} disabled={cardBlocked.includes(index)} id={index} >
              <img
                alt=""
                className="cards__image"
                src={cardScreen.image}                
                id={index}                
              />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
