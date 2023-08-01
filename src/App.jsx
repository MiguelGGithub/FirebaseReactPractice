import { useState, useEffect, useRef } from 'react'
import './css/App.css'
import { Auth } from './components/auth'
import { db, auth, storage } from './config/firebase-config'
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
function App() {
  const [count, setCount] = useState(0)
  const [movieList, setMovieList] = useState([])
  

  //New movie states
  const [newMovieTitle, setNewMovieTitle] = useState('')
  const [newMovieReleaseDate, setNewMovieReleaseDate] = useState('')
  const [newMovieOscar, setNewMovieOscar] = useState(false)

  //Update title state
  const [updateTitle, setUpdateTitle] = useState('')

  //Upload File state
  const [uploadFile, setUploadFile] = useState(null)

  const moviesCollectionRef = collection(db, 'movies')

  const getMovieList = async () => {
    try{
      const data = await getDocs(moviesCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMovieList(filteredData)
      
      
    } catch (err) {
      console.error(err)

    }
  }

  useEffect(() => {

    getMovieList()
  }, [])

  const onSubmitMovie = async () => {
    try {
      const moviesRef = collection(db, 'movies');
  
      // Upload the file to Firebase Storage
      if (uploadFile) {
        const fileRef = ref(storage, `projectFiles/${uploadFile.name}`);
        await uploadBytes(fileRef, uploadFile);
  
        // Get the file URL after uploading
        const fileURL = await getDownloadURL(fileRef);
  
        // Add the file URL to the movie object
        const movieObject = {
          title: newMovieTitle,
          releaseDate: newMovieReleaseDate,
          receivedAnOscar: newMovieOscar,
          userId: auth?.currentUser?.uid,
          fileURL: fileURL,
        };
  
        // Add the movie object to the movies collection
        await addDoc(moviesRef, movieObject);
      } else {
        // If no file is uploaded, add the movie without the fileURL property
        await addDoc(moviesRef, {
          title: newMovieTitle,
          releaseDate: newMovieReleaseDate,
          receivedAnOscar: newMovieOscar,
          userId: auth?.currentUser?.uid,
        });
      }
  
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };
  
  const deleteMovie = async (id) => {
    try {
      const movieDoc = doc(db, 'movies', id)
      await deleteDoc(movieDoc)
      getMovieList()
    } catch (err) {
      console.error(err)
    }
  }

  const updateMovieTitle = async (id) => {
    try {
      const movieDoc = doc(db, 'movies', id)
      await updateDoc(movieDoc, {
        title: updateTitle,
      })
      getMovieList()
    } catch (err) {
      console.error(err)
    }
  }

  const uploadFileToStorage = async () => {
    if(!uploadFile) return;
    const filesFolderRef = ref(storage, `projectFiles/${uploadFile.name}`)
    try {
      await uploadBytes(filesFolderRef, uploadFile)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className='left-content'>
        <div className="App">
            <Auth />
            
          </div>
          
      </div>

      <div>
        <div className='enter-movie'>
          <h1>Enter Movie</h1>
              <input placeholder="Movie title" onChange={(e) => setNewMovieTitle(e.target.value)}/>
              <input placeholder="Release date" onChange={(e) => setNewMovieReleaseDate(Number(e.target.value))}/>
              
              <label htmlFor="checkOscar">Recieved an Oscar 
              <input 
                type="checkbox" 
                id='checkOscar'
                checked={newMovieOscar}
                onChange={(e) => setNewMovieOscar(e.target.checked)}
              />
              </label>
              <div>
                <input type="file" onChange={(e) => setUploadFile(e.target.files[0])}/>
                <button onClick={uploadFileToStorage}>Upload</button>
              </div>


              <button onClick={onSubmitMovie}>Submit Movie</button>
          </div>
      </div>
      <SimpleBar  forceVisible="y" autoHide={true} style={{ minWidth: '60vw', maxWidth: '60vw', minHeight: '60vh', maxHeight: '60vh'}} >
        <div className='movieList'>
          {movieList.map((movie) => (
            
            <div key={movie.id} className="movie-card">
              <h1 style={movie.receivedAnOscar == true ? {color: '#e74606'} : {color: 'white'}}>{movie.title}</h1>
              <img src={movie.fileURL} alt="" />
              <p>Date: {movie.releaseDate}</p>
              
              <div className="buttons-container">
                
                <div>
                  <input placeholder="New Title..." onChange={(e) => setUpdateTitle(e.target.value)}/>
                  <button onClick={() => updateMovieTitle(movie.id)}>Update Title</button>
                </div>
                <div>

                </div>
                <button onClick={() => deleteMovie(movie.id)}>X</button>
              </div>
            </div>
          ))}

        </div>
      </SimpleBar>
      
    </>
  )
}

export default App
