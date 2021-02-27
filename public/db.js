// global variable for database
let db

// global indexDB variable
const request = indexedDB.open('budget', 1)

// used to update db when changes are made
request.onupgradeneeded = event => {
  // get values of db
  db = event.target.result
  // creating collection
  db.createObjectStore('pending', {
    autoIncrement: true
  })
}

// tells app what to do when connected to db
request.onsuccess = event => {
  // get values of db
  db = event.target.result

  // check to see if app online
  if (navigator.onLine) {
    // function to check db
    checkDatabase()
  }
}

// runs when error occurs
request.onerror = event => {
  console.log(event.target.errorCode)
}


// if post fails (in .catch statement index.js #49) want to post to indexdb
const saveRecord = record => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')

  store.add(record)
}

const checkDatabase = () => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  const getAll = store.getAll()

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      axios.post('/api/transaction/bulk', getAll.result)
        .then(() => {
          // remove records if successful
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore('pending')
          store.clear()
        })
    }
  }
}


window.addEventListener('online', checkDatabase)

