import React from 'react'
import {Helmet} from 'react-helmet'
import WebTorrent from 'webtorrent'
import axios from 'axios'
import queryString from 'query-string'
import prettyBytes from 'pretty-bytes'
import throttle from 'throttleit'

const ERR_MESSAGE = '[+] Webtorrent error: '

class Watch extends React.Component{
    state = {
        torrent: null,
        loadingText: 'Loading'
    }

    async componentDidMount() {
        const instance = this
        const {location} = this.props
        const {url} = queryString.parse(location.search)

        this.setState({loadingText: 'Loading torrent data'})
        
        // torrent file
        const torrentRequest = await axios.get(url, {responseType: 'blob'}).catch(result=>{
            instance.setState({loadingText: ERR_MESSAGE + 'failed to download'})
            return result.response
        })
        if(!torrentRequest)
            return
        
        // webtorrent
        const client = new WebTorrent()
        client.on('error', err => instance.setState({loadingText: ERR_MESSAGE + err.message}))

        client.add(torrentRequest.data, (torrent) => {
            const updateSpeed = ()=>{
                instance.setState({
                    progress: (100 * torrent.progress).toFixed(1),
                    numPeers: torrent.numPeers,
                    downloadSpeed: prettyBytes(torrent.downloadSpeed),
                    uploadSpeed: prettyBytes(torrent.uploadSpeed)
                })
            }
            
            torrent.on('error', err => instance.setState({loadingText: ERR_MESSAGE + err.message}))

            // progress
            torrent.on('download', throttle(updateSpeed, 250))
            torrent.on('upload', throttle(updateSpeed, 250))
            setInterval(updateSpeed, 5000)
            updateSpeed()
            
            this.setState({
                torrent, 
                loadingText: 'Loading video'
            })

            // file
            const mp4file = torrent.files.find((file) => file.name.endsWith('.mp4'))
            mp4file.appendTo(document.querySelector('#player-container'))

            // remove loading
            torrent.on('ready', ()=>{
                instance.setState({loadingText: ''})
            })
        })
    }

    renderInfo(torrent){
        const {progress, numPeers, downloadSpeed, uploadSpeed} = this.state
        return (
          <section>
            <Helmet>
              <title>{'Watch ' + torrent.name}</title>
            </Helmet>
            <table style={{textAlign: 'center', width: '100%'}}>
              <thead>
                <tr>
                  <th>Peers</th>
                  <th>Download Speed</th>
                  <th>Upload Speed</th>
                  <th>Progress</th>
                  <th>Info Hash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{numPeers}</td>
                  <td>{downloadSpeed}</td>
                  <td>{uploadSpeed}</td>
                  <td>{progress + ' %'}</td>
                  <td>{torrent.infoHash}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )
    }

    renderLoading(loadingText){
        return (
          <center style={{fontSize: '30px', marginTop: '45px'}}>{loadingText + '...'}</center>
        )
    }

    render() {
        const {loadingText, torrent} = this.state
        return (
          <div>
            {torrent ? (<h2 style={{textAlign: 'center'}}>{torrent.name}</h2>) : ''}
            <div id="player-container" style={{width: '100%', textAlign: 'center'}}>
              {loadingText ? this.renderLoading(loadingText) : ''}
            </div>
            <div id="torrent-info" style={{marginTop: '45px'}}>{torrent ? this.renderInfo(torrent) : ''}</div>
          </div>
        )
    }
}
export default Watch