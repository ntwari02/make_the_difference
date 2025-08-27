function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = `fixed top-6 right-6 px-4 py-2 rounded text-white shadow-lg ${type==='success'?'bg-green-600':type==='error'?'bg-red-600':'bg-blue-600'}`;
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

function setAvatar(url) {
  const holder = document.getElementById('avatarHolder');
  const img = document.getElementById('avatarImg');
  const icon = document.getElementById('defaultAvatarIcon');
  if (url) {
    const src = (url.startsWith('http') || url.startsWith('/')) ? url : `/${url}`;
    img.src = src;
    img.classList.remove('hidden');
    icon.classList.add('hidden');
  } else {
    img.classList.add('hidden');
    img.removeAttribute('src');
    icon.classList.remove('hidden');
  }
}

async function initializeProfilePage() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('fullName').textContent = user.full_name || user.fullName || '-';
    document.getElementById('email').textContent = user.email || '-';
    setAvatar(user.profile_picture || user.profile_picture_path || '');

    const fileInput = document.getElementById('profileFile');
    const deleteBtn = document.getElementById('deleteBtn');

    fileInput.addEventListener('change', async () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      const token = localStorage.getItem('token');
      const fd = new FormData();
      // Server expects 'profilePicture' from admin account flow; include basic fields
      fd.append('profilePicture', f);
      fd.append('fullName', user.full_name || user.fullName || '');
      fd.append('email', user.email || '');
      try {
        const res = await fetch('/api/admin/account', { method: 'POST', headers: token?{ 'Authorization': `Bearer ${token}` }: {}, body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        const newPath = data.profile_picture || data.profile_picture_path;
        if (newPath) {
          setAvatar(newPath);
          user.profile_picture = newPath;
          localStorage.setItem('user', JSON.stringify(user));
          showToast('Profile picture updated', 'success');
        } else {
          showToast('Upload successful', 'success');
        }
      } catch (e) {
        showToast(e.message || 'Failed to upload', 'error');
      } finally {
        fileInput.value = '';
      }
    });

    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Remove your profile picture?')) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/profile-picture', { method: 'DELETE', headers: token?{ 'Authorization': `Bearer ${token}` }: {} });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.message || 'Delete failed');
        setAvatar('');
        delete user.profile_picture;
        localStorage.setItem('user', JSON.stringify(user));
        showToast('Profile picture removed', 'success');
      } catch (e) {
        showToast(e.message || 'Failed to delete', 'error');
      }
    });
  } catch (e) {
    // noop
  }
}

document.addEventListener('DOMContentLoaded', initializeProfilePage);


