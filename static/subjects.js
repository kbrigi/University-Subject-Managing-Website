// makes a list of the files
async function showFiles(event, id) {
  const resp = await fetch(`/subj_file?id=${id}`, { method: 'GET' });
  const result = await resp.json();

  const files = document.getElementById('files');
  files.replaceChildren();

  if (resp.status === 200) {
    for (let i = 0; i < result.length;  i += 1) {
      const listElement = document.createElement('li');
      const listItem = document.createElement('a');
      listItem.setAttribute('href', result[i].fileName);
      listItem.innerText = result[i].fileName;
      listElement.appendChild(listItem);
      files.appendChild(listElement);
    }
  } else {
    files.innerText = 'Unsuccessful file select!';
  }
}

// deletes a selected subject(only admin)
async function deleteSubject(event, id) {
  const resp = await fetch(`/delete_subj?id=${id}`, { method: 'DELETE' });
  const mes = document.getElementById('mes');
  if (resp.status === 200) {
    const row = document.getElementById(`subj-${id}`);
    row.innerText = '';
    mes.innerText = 'Successful delet!';
  } else {
    mes.innerText = 'Unsuccessful delet!';
  }
}
