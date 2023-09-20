// deletes the selected file of a subject
async function deleteFile(event, id) {
  const resp = await fetch(`/delete?id=${id}`, { method: 'DELETE' });
  const mes = document.getElementById('mes');
  if (resp.status === 200) {
    const row = document.getElementById(`file-${id}`);
    row.innerText = '';
    mes.innerText = 'Successful delet!';
  } else {
    mes.innerText = 'Unsuccessful delet!';
  }
}
