const dialog = document.querySelector('#dialog');
document.querySelector('#open').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('close', () => console.log('returnValue:', dialog.returnValue));
