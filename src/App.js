import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

// import logo from './logo.svg'
import './App.css'

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      movies: {}
    }
  }

  componentDidMount(){
    const instance = this
    axios.get('https://yts.am/api/v2/list_movies.json').then(result=>{
      const movies = {}
      result.data.data.movies.forEach(movie => {
        movies[movie.id] = movie
      })
      instance.setState({movies})
    })
  }

  openMovie(id, event){
    const {movies} = this.state
    console.log(movies[id])
    movies[id].isOpen = !movies[id].isOpen
    this.setState({movies})
    event.preventDefault()
  }

  renderDetails(movie){
    return (
      <ul>
        {movie.torrents.map(torrent=>(
          <li key={torrent.hash}>
            <Link to={'/watch/' + movie.slug + '/?url=' + torrent.url}>
              {torrent.quality}
              {' '}
              {torrent.size} 
              {' '}
              {torrent.seeds} 
              {' '}
              {torrent.peers}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    const {children} = this.props
    const {movies} = this.state
    const openMovie = this.openMovie.bind(this)
    return (
      <div className="App">
        <ul>
          {Object.values(movies).map((movie, index)=>
            (
              <li key={movie.imdb_code} style={{display: 'inline-block', margin: '5px'}}>
                <span role="link" onKeyDown={(event)=>openMovie(movie.id, event)} tabIndex={index * -1} onClick={(event)=>openMovie(movie.id, event)}>
                  <img src={movie.small_cover_image} alt={movie.title} />
                  <br />
                  {movie.title}
                </span>
                {movie.isOpen ? (this.renderDetails(movie)) : ''}
              </li>
            )
          )}
        </ul>
        {children}
      </div>
    )
  }
}

export default App
