import React, { useState } from 'react'
import Web3 from 'web3'

import { BACKEND_URL } from './config'
import './App.css'

function App() {
  // Hold an error message, or a success message from backend if there's any.
  const [error, setError] = useState('')

  // Handle a click event of login button.
  const handleLogin = async () => {
    try {
      // Retrieve nonce from backend.
      const response = await fetch(`${BACKEND_URL}/token`)
      const nonce = await response.json()

      if (!window.ethereum) {
        throw new Error('Please install MetaMask extension.')
      }

      // Retrieve the current MetaMask account.
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts.length) {
        throw new Error('No account is found.')
      }

      // Sign the nonce with the current account address.
      const web3 = new Web3(Web3.givenProvider)
      const signature = await web3.eth.personal.sign(nonce.toString(), accounts[0])

      // Send a signature to backend for verification.
      const authResponse = await fetch(`${BACKEND_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: accounts[0],
          signature,
          nonce,
        }),
      })

      // Get and display the success message.
      const responseText = await authResponse.text()
      setError(responseText)
    } catch (e) {
      setError(e.message || 'Failed to login.')
    }
  }

  return (
    <div className="login-container">
      <button type="button" onClick={handleLogin}>
        Login with MetaMask
      </button>
      {
        error !== '' && (
          <div className="error-message">
            { error }
          </div>
        )
      }
    </div>
  )
}

export default App
