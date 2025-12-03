// App State
const app = {
  deferredPrompt: null,
  installPrompt: null,
  currentSection: "dashboard",
  videoOverlay: null,
  videoPlayer: null,

  // Initialize App
  init() {
    console.log("[v0] App initializing...")

    // Set install prompt reference with safety check
    const prompt = document.getElementById("install-prompt")
    if (prompt) {
      this.installPrompt = prompt
    }

    this.videoOverlay = document.getElementById("video-player-overlay")
    this.videoPlayer = document.getElementById("fullscreen-video")

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("service-worker.js")
        .then((reg) => console.log("[v0] Service Worker registered"))
        .catch((err) => console.error("[v0] Service Worker registration failed:", err))
    }

    // Load initial data
    this.loadCustomers()
    this.loadVideos()
    this.updateStats()
    this.populateHours()

    // Handle online/offline
    window.addEventListener("online", () => this.updateConnectionStatus(true))
    window.addEventListener("offline", () => this.updateConnectionStatus(false))

    // Install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallPrompt()
    })

    document.addEventListener("fullscreenchange", () => this.handleFullscreenChange())
    document.addEventListener("webkitfullscreenchange", () => this.handleFullscreenChange())

    if (this.videoPlayer) {
      this.videoPlayer.addEventListener("ended", () => this.closeVideoPlayer())
    }

    // Update stats every minute
    setInterval(() => this.updateStats(), 60000)

    this.updateConnectionStatus(navigator.onLine)

    console.log("[v0] App initialized successfully")
  },

  // Switch Section
  switchSection(sectionName) {
    console.log("[v0] Switching to section:", sectionName)

    // Hide all sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active")
    })

    // Show selected section
    const section = document.getElementById(sectionName)
    if (section) {
      section.classList.add("active")
      this.currentSection = sectionName
    }

    // Update nav buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.section === sectionName)
    })
  },

  // Load Customer Data
  loadCustomers() {
    console.log("[v0] Loading customers...")

    // Sample customer data
    const customers = [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "Active" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", status: "Active" },
      { id: 3, name: "Carol White", email: "carol@example.com", status: "Inactive" },
      { id: 4, name: "David Brown", email: "david@example.com", status: "Active" },
      { id: 5, name: "Eve Davis", email: "eve@example.com", status: "Active" },
      { id: 6, name: "Frank Miller", email: "frank@example.com", status: "Inactive" },
    ]

    // Save to localStorage
    localStorage.setItem("customers", JSON.stringify(customers))

    // Render customers with safety check
    const list = document.getElementById("customers-list")
    if (list) {
      list.innerHTML = customers
        .map(
          (customer) => `
                <div class="customer-card">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-email">${customer.email}</div>
                    <span class="customer-status">${customer.status}</span>
                </div>
            `,
        )
        .join("")
    }

    console.log("[v0] Customers loaded:", customers.length)
  },

  loadVideos() {
    console.log("[v0] Loading videos...")

    // Sample video data - using public domain sample videos
    const videos = [
      {
        id: 1,
        title: "Company Introduction",
        duration: "2:30",
        thumbnail: "/placeholder.svg?height=180&width=320",
        src: "https://www.youtube.com/watch?v=Xd2xr7zIFyk",
      },
      {
        id: 2,
        title: "Product Demo",
        duration: "4:15",
        thumbnail: "/placeholder.svg?height=180&width=320",
        src: "https://www.youtube.com/watch?v=G1hKzCkywM8",
      },
      {
        id: 3,
        title: "Customer Success Story",
        duration: "3:45",
        thumbnail: "/placeholder.svg?height=180&width=320",
        src: "https://www.youtube.com/watch?v=a-8XiE7W7u4",
      },
      {
        id: 4,
        title: "How To Get Started",
        duration: "5:00",
        thumbnail: "/placeholder.svg?height=180&width=320",
        src: "https://www.youtube.com/watch?v=u_5wLvlRhc0",
      },
      {
        id: 5,
        title: "Feature Highlights",
        duration: "2:15",
        thumbnail: "/placeholder.svg?height=180&width=320",
        src: "./public/example.mov",
      },
    ]

    // Save to localStorage
    localStorage.setItem("videos", JSON.stringify(videos))

    // Render videos with safety check
    const list = document.getElementById("videos-list")
    if (list) {
      list.innerHTML = videos
        .map(
          (video) => `
            <div class="video-card" onclick="app.openVideoPlayer('${video.src}', '${video.title}')">
              <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-play-icon">▶</div>
              </div>
              <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-duration">${video.duration}</div>
              </div>
            </div>
          `,
        )
        .join("")
    }

    console.log("[v0] Videos loaded:", videos.length)
  },

  openVideoPlayer(videoSrc, title) {
    console.log("[v0] Opening video player:", title)

    if (!this.videoOverlay || !this.videoPlayer) {
      console.error("[v0] Video player elements not found")
      return
    }

    // Set video source
    this.videoPlayer.src = videoSrc

    // Show overlay
    this.videoOverlay.classList.remove("hidden")

    // Try to lock screen orientation to landscape
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch((err) => {
        console.log("[v0] Could not lock orientation:", err.message)
      })
    }

    // Try to enter fullscreen mode
    const overlay = this.videoOverlay
    if (overlay.requestFullscreen) {
      overlay.requestFullscreen().catch((err) => {
        console.log("[v0] Fullscreen request failed:", err.message)
      })
    } else if (overlay.webkitRequestFullscreen) {
      overlay.webkitRequestFullscreen()
    } else if (overlay.msRequestFullscreen) {
      overlay.msRequestFullscreen()
    }

    // Start playing the video
    this.videoPlayer.play().catch((err) => {
      console.log("[v0] Autoplay failed:", err.message)
    })

    // Hide the navigation bar
    document.body.style.overflow = "hidden"
  },

  closeVideoPlayer() {
    console.log("[v0] Closing video player")

    if (!this.videoOverlay || !this.videoPlayer) {
      return
    }

    // Pause and reset video
    this.videoPlayer.pause()
    this.videoPlayer.src = ""

    // Hide overlay
    this.videoOverlay.classList.add("hidden")

    // Exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }

    // Unlock screen orientation
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock()
    }

    // Restore body scroll
    document.body.style.overflow = ""
  },

  handleFullscreenChange() {
    // If user exits fullscreen while video is playing, close the player
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (this.videoOverlay && !this.videoOverlay.classList.contains("hidden")) {
        // Video overlay is still visible but fullscreen exited
        // Keep overlay visible but user can close with X button
        console.log("[v0] Exited fullscreen mode")
      }
    }
  },

  // Populate Business Hours
  populateHours() {
    console.log("[v0] Populating business hours...")

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const today = new Date().getDay()

    const hoursList = document.getElementById("hours-list")
    if (hoursList) {
      hoursList.innerHTML = days
        .map((day, index) => {
          const isToday = index === (today === 0 ? 6 : today - 1)
          const time = index < 5 ? "9:00 AM - 6:00 PM" : "10:00 AM - 4:00 PM"

          return `
                    <div class="hours-item ${isToday ? "today" : ""}">
                        <span class="hours-day">${day}</span>
                        <span class="hours-time">${time}</span>
                    </div>
                `
        })
        .join("")
    }

    console.log("[v0] Business hours populated")
  },

  // Update Statistics
  updateStats() {
    console.log("[v0] Updating statistics...")

    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const visits = Number.parseInt(localStorage.getItem("visits") || "0") + 1

    localStorage.setItem("visits", visits.toString())

    const countEl = document.getElementById("customer-count")
    const visitsEl = document.getElementById("total-visits")
    const updateEl = document.getElementById("last-updated")

    if (countEl) countEl.textContent = customers.length
    if (visitsEl) visitsEl.textContent = visits

    if (updateEl) {
      const now = new Date()
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      updateEl.textContent = timeString
    }

    console.log("[v0] Stats updated - Visits:", visits)
  },

  // Connection Status
  updateConnectionStatus(isOnline) {
    console.log("[v0] Connection status:", isOnline ? "online" : "offline")

    const statusDot = document.querySelector(".status-dot")
    const statusText = document.querySelector(".status-text")

    if (statusDot && statusText) {
      if (isOnline) {
        statusDot.classList.remove("offline")
        statusText.textContent = "Online"
      } else {
        statusDot.classList.add("offline")
        statusText.textContent = "Offline"
      }
    }
  },

  // Refresh Data
  refreshData() {
    console.log("[v0] Refreshing data...")

    this.loadCustomers()
    this.loadVideos()
    this.updateStats()
    alert("Data refreshed successfully!")
  },

  // Show Install Prompt
  showInstallPrompt() {
    console.log("[v0] Showing install prompt")

    if (this.installPrompt && !this.installPrompt.classList.contains("hidden")) {
      this.installPrompt.classList.remove("hidden")
    }
  },

  // Install App
  installApp() {
    console.log("[v0] Installing app...")

    if (this.deferredPrompt) {
      this.deferredPrompt.prompt()
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("[v0] App installed")
          this.deferredPrompt = null
          this.dismissInstall()
        }
      })
    }
  },

  // Dismiss Install Prompt
  dismissInstall() {
    console.log("[v0] Dismissing install prompt")

    if (this.installPrompt) {
      this.installPrompt.classList.add("hidden")
    }
  },

  // Clear Cache
  clearCache() {
    console.log("[v0] Clearing cache...")

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_CACHE",
      })
    }

    alert("Cache cleared successfully!")
  },

  // Export Data
  exportData() {
    console.log("[v0] Exporting data...")

    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const videos = JSON.parse(localStorage.getItem("videos") || "[]")
    const visits = localStorage.getItem("visits") || "0"

    const data = {
      exportDate: new Date().toISOString(),
      customers: customers,
      videos: videos,
      totalVisits: visits,
    }

    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `infohub-data-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("[v0] Data exported")
  },
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init())
} else {
  app.init()
}
