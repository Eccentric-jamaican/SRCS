// Import Firebase services
import { db, auth } from './firebase-config.js';

// DOM Elements
const blogPostsContainer = document.getElementById('blogPosts');
const authButton = document.getElementById('authButton');
const adminControls = document.getElementById('adminControls');
const newPostBtn = document.getElementById('newPostBtn');
const blogModal = document.getElementById('blogModal');
const closeBlogModal = document.getElementById('closeBlogModal');
const blogPostForm = document.getElementById('blogPostForm');
const postTitle = document.getElementById('postTitle');
const postAuthor = document.getElementById('postAuthor');
const postContent = document.getElementById('postContent');
const postTags = document.getElementById('postTags');
const postId = document.getElementById('postId');
const deletePostBtn = document.getElementById('deletePost');
const privacyModal = document.getElementById('privacyModal');
const privacyPolicyBtn = document.getElementById('privacyPolicyBtn');
const closeModal = document.getElementById('closeModal');
const acceptPrivacy = document.getElementById('acceptPrivacy');

// Mobile Navigation Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
let isMenuOpen = false;

// Current user state
let currentUser = null;

// Toggle mobile menu
function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        // Open menu
        document.body.style.overflow = 'hidden';
        mobileNavOverlay.classList.remove('hidden');
        mobileMenu.classList.remove('hidden');
        
        // Trigger reflow
        void mobileNavOverlay.offsetWidth;
        
        // Add active classes
        mobileNavOverlay.classList.add('open');
        mobileMenu.classList.add('open');
        
        // Set focus to first nav item
        setTimeout(() => {
            const firstNavItem = mobileMenu.querySelector('a[href], button');
            if (firstNavItem) firstNavItem.focus();
        }, 100);
    } else {
        // Close menu
        document.body.style.overflow = '';
        mobileNavOverlay.classList.remove('open');
        mobileMenu.classList.remove('open');
        
        // Reset state after animation
        setTimeout(() => {
            if (!isMenuOpen) {  // Check if still closed
                mobileNavOverlay.classList.add('hidden');
                mobileMenu.classList.add('hidden');
            }
        }, 300);
    }
    
    // Update aria attributes
    mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen);
}

// Close mobile menu when clicking on a nav link
function closeMobileMenu() {
    if (isMenuOpen) {
        toggleMobileMenu();
    }
}

// Initialize the application
function initApp() {
    // Initialize modals
    initModals();
    
    // Set up Firebase auth state listener
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI();
        
        // Load blog posts if user is authenticated
        if (user) {
            loadBlogPosts();
        }
    });
    
    // Set up auth button click handler
    if (authButton) authButton.addEventListener('click', toggleAuth);
    
    // Set up new post button
    if (newPostBtn) newPostBtn.addEventListener('click', () => openBlogModal());
    
    // Set up blog form submission
    if (blogPostForm) blogPostForm.addEventListener('submit', handleBlogPostSubmit);
    
    // Set up delete post button
    if (deletePostBtn) deletePostBtn.addEventListener('click', handleDeletePost);
    
    // Set up cancel button in blog modal
    const cancelPostBtn = document.getElementById('cancelPost');
    if (cancelPostBtn) cancelPostBtn.addEventListener('click', () => closeBlogModal());
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === blogModal) closeBlogModal();
        if (e.target === privacyModal) closePrivacyModal();
    });
    
    // Set up mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on overlay
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close mobile menu when clicking on nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
            mobileMenuBtn.focus();
        }
    });
    
    // Load blog posts for public view
    loadBlogPosts();
}

// Initialize modals
function initModals() {
    // Privacy policy modal
    privacyPolicyBtn.addEventListener('click', openPrivacyModal);
    closeModal.addEventListener('click', closePrivacyModal);
    acceptPrivacy.addEventListener('click', closePrivacyModal);
    
    // Blog post modal
    closeBlogModal.addEventListener('click', () => closeBlogModal());
}

// Toggle authentication state
async function toggleAuth() {
    if (currentUser) {
        // Sign out
        try {
            await auth.signOut();
            closeBlogModal(); // Close any open modals
        } catch (error) {
            console.error('Error signing out:', error);
            showNotification('Error signing out. Please try again.', 'error');
        }
    } else {
        // Sign in with Google
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Error signing in:', error);
            showNotification('Error signing in. Please try again.', 'error');
        }
    }
}

// Update UI based on authentication state
function updateAuthUI() {
    if (currentUser) {
        authButton.textContent = 'Logout';
        adminControls.classList.remove('hidden');
        
        // Check if user is admin (you can implement your own logic here)
        checkIfAdmin(currentUser.uid);
    } else {
        authButton.textContent = 'Login';
        adminControls.classList.add('hidden');
    }
}

// Check if user is admin
function checkIfAdmin(userId) {
    // Implement your own admin check logic here
    // For example, you could check against a Firestore collection of admin users
    const admins = ['admin1@example.com', 'admin2@example.com'];
    
    if (currentUser && admins.includes(currentUser.email)) {
        // User is admin, show admin controls
        adminControls.classList.remove('hidden');
    } else {
        adminControls.classList.add('hidden');
    }
}

// Check authentication state
function checkAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
            
            // Check if user is admin
            checkIfAdmin(user.uid);
        } else {
            // User is signed out
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
            
            // Hide admin controls
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
    });
}

// Google Sign-In
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((error) => {
        console.error('Error signing in:', error);
        showNotification('Error signing in. Please try again.', 'error');
    });
}

// Sign out
function signOut() {
    firebase.auth().signOut().then(() => {
        showNotification('Successfully signed out', 'success');
    }).catch((error) => {
        console.error('Error signing out:', error);
        showNotification('Error signing out', 'error');
    });
}

// Load blog posts with pagination
let lastVisible = null;
let loading = false;
const POSTS_PER_PAGE = 6;

function loadBlogPosts(loadMore = false) {
    if (loading) return;
    
    loading = true;
    const loadingElement = document.getElementById('loadingIndicator');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    if (loadingElement) loadingElement.classList.remove('hidden');
    
    const db = firebase.firestore();
    let query = db.collection('posts')
        .where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(POSTS_PER_PAGE);
    
    // If loading more, start after the last visible document
    if (loadMore && lastVisible) {
        query = query.startAfter(lastVisible);
    }
    
    query.get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                if (loadingElement) loadingElement.classList.add('hidden');
                if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                return;
            }
            
            // Update last visible document for pagination
            lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            
            // If it's the first load, clear the container
            if (!loadMore) {
                blogPostsContainer.innerHTML = '';
            }
            
            // Process each document
            querySnapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                const postElement = createBlogPostElement(post);
                blogPostsContainer.appendChild(postElement);
            });
            
            // Show/hide load more button
            if (loadMoreBtn) {
                if (querySnapshot.size === POSTS_PER_PAGE) {
                    loadMoreBtn.classList.remove('hidden');
                } else {
                    loadMoreBtn.classList.add('hidden');
                }
            }
            
            // Initialize any interactive elements in the new posts
            initializeBlogPostInteractions();
        })
        .catch((error) => {
            console.error('Error loading blog posts:', error);
            showNotification('Error loading blog posts. Please try again.', 'error');
        })
        .finally(() => {
            loading = false;
            if (loadingElement) loadingElement.classList.add('hidden');
        });
}

// Initialize event listeners for blog post interactions
function initializeBlogPostInteractions() {
    // Add click handlers for blog post cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link or button inside the card
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a, button')) {
                return;
            }
            
            const postId = card.dataset.postId;
            if (postId) {
                viewPost(postId);
            }
        });
    });
    
    // Add hover effect for desktop
    if (window.innerWidth >= 768) {
        document.querySelectorAll('.blog-card').forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
}

}

// Create blog post element
function createBlogPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'blog-card animate-fadeIn';
    
    // Format date
    const postDate = post.createdAt ? post.createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Unknown date';
    
    // Create tags
    const tags = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];
    
    postElement.innerHTML = `
        <div class="blog-card-content">
            <h3 class="blog-card-title">${post.title || 'Untitled Post'}</h3>
            <div class="blog-card-meta">
                <span>By ${post.author || 'Unknown Author'}</span>
                <span class="mx-2">•</span>
                <span>${postDate}</span>
            </div>
            <p class="blog-card-excerpt">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
            <div class="mt-4">
                ${tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
            </div>
            ${currentUser ? `
                <div class="mt-4 flex space-x-2">
                    <button class="btn-secondary edit-post" data-id="${post.id}">Edit</button>
                    <button class="btn-secondary delete-post" data-id="${post.id}">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add event listeners for edit and delete buttons
    if (currentUser) {
        const editBtn = postElement.querySelector('.edit-post');
        const deleteBtn = postElement.querySelector('.delete-post');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => editPost(post));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this post?')) {
                    deletePost(post.id);
                }
            });
        }
    }
    
    // Make the whole card clickable to view the full post
    postElement.addEventListener('click', () => viewPost(post));
    
    return postElement;
}

// Open blog modal for creating/editing a post
function openBlogModal(post = null) {
    if (post) {
        // Edit mode
        document.getElementById('modalTitle').textContent = 'Edit Blog Post';
        postId.value = post.id;
        postTitle.value = post.title || '';
        postAuthor.value = post.author || '';
        postContent.value = post.content || '';
        postTags.value = post.tags || '';
        deletePostBtn.classList.remove('hidden');
    } else {
        // Create mode
        document.getElementById('modalTitle').textContent = 'New Blog Post';
        postId.value = '';
        postTitle.value = '';
        postAuthor.value = currentUser ? currentUser.displayName || currentUser.email.split('@')[0] : '';
        postContent.value = '';
        postTags.value = '';
        deletePostBtn.classList.add('hidden');
    }
    
    // Show modal with animation
    blogModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Trigger reflow to enable animation
    void blogModal.offsetWidth;
    
    // Add active class for animation
    setTimeout(() => {
        const modalContent = document.getElementById('blogModalContent');
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Close blog modal
function closeBlogModal() {
    const modalContent = document.getElementById('blogModalContent');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        blogModal.classList.add('hidden');
        document.body.style.overflow = '';
        blogPostForm.reset();
    }, 200);
}

// Handle blog post form submission
async function handleBlogPostSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('You must be logged in to create or edit posts.', 'error');
        return;
    }
    
    const title = postTitle.value.trim();
    const author = postAuthor.value.trim();
    const content = postContent.value.trim();
    const tags = postTags.value.trim();
    
    if (!title || !content) {
        showNotification('Title and content are required.', 'error');
        return;
    }
    
    const postData = {
        title,
        author: author || 'Anonymous',
        content,
        tags,
        updatedAt: new Date()
    };
    
    try {
        if (postId.value) {
            // Update existing post
            await db.collection('posts').doc(postId.value).update(postData);
            showNotification('Post updated successfully!', 'success');
        } else {
            // Create new post
            postData.createdAt = new Date();
            postData.userId = currentUser.uid;
            await db.collection('posts').add(postData);
            showNotification('Post created successfully!', 'success');
        }
        
        closeBlogModal();
    } catch (error) {
        console.error('Error saving post:', error);
        showNotification('Error saving post. Please try again.', 'error');
    }
}

// Handle delete post
async function handleDeletePost() {
    if (!postId.value || !currentUser) return;
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            await db.collection('posts').doc(postId.value).delete();
            showNotification('Post deleted successfully!', 'success');
            closeBlogModal();
        } catch (error) {
            console.error('Error deleting post:', error);
            showNotification('Error deleting post. Please try again.', 'error');
        }
    }
}

// Edit post
function editPost(post) {
    openBlogModal(post);
}

// Delete post
async function deletePost(postId) {
    if (!currentUser) return;
    
    try {
        await db.collection('posts').doc(postId).delete();
        showNotification('Post deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Error deleting post. Please try again.', 'error');
    }
}

// View full post
function viewPost(post) {
    // For now, just open the modal in view mode
    openBlogModal(post);
    
    // In a real app, you might want to navigate to a dedicated post page
    // window.location.href = `/post.html?id=${post.id}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // You can implement a more sophisticated notification system
    alert(`${type.toUpperCase()}: ${message}`);
}

// Open privacy policy modal
function openPrivacyModal() {
    privacyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Trigger reflow to enable animation
    void privacyModal.offsetWidth;
    
    // Add active class for animation
    setTimeout(() => {
        const modalContent = document.getElementById('privacyModalContent');
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Close privacy policy modal
function closePrivacyModal() {
    const modalContent = document.getElementById('privacyModalContent');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        privacyModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 200);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
