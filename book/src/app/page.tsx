import React from 'react'
import Navbar from './components/Navbar'
import Search from './components/Search'
import { MovieCarousel } from './components/Carousel'
import MovieCarouseley from './components/MovieCard'


const page = () => {
  return (
    <> 
    
    
    <Navbar> </Navbar>
    <MovieCarousel></MovieCarousel>
    <MovieCarouseley></MovieCarouseley> 
    </>

  )
}

export default page