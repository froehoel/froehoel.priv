// https://www.linkedin.com/pulse/upload-multiple-files-html-5-javascript-progress-bar-cancel-hewage

const fileupload = document.getElementById('fileUploadBtn');
const target = fileupload.dataset.target;
const fileuploadWrapper = document.querySelector('.fileUploadLabel');
const progressWrapper = document.querySelector('.fileUploadProgress');
const fileList = document.getElementById('fileList');

fileupload.addEventListener('click', event => {
  while(progressWrapper.firstChild) {
    progressWrapper.removeChild(progressWrapper.lastChild);
  }
});

fileupload.addEventListener('change', event => {
  const number_of_files = fileupload.files.length;
  for(let i = 0; i < number_of_files; i++) {
    uploadFiles(fileupload.files[i], i);
  }
});

const progressbar = (fileID, filename) => {
  const html = `
    <div class="progressItem" id="progress-${fileID}">
      <div class="progress-bar active" id="progress-bar-${fileID}" role="progressbar" aria-valuemax="100" style="width: 0; height: 2px;"></div>
      <div class="progress-status"><span class="progress-filename" id="progress-filename-${fileID}">${filename}</span> <span id="progress-status-${fileID}">0</span></div>
    </div>
  `;
  return html;
}

const filelist = (json) => {
  const html = `
    <p>
      <a href="delete-attachment.php?attachmentid=${json.id}" class="btn">
        <span>slett vedlegg</span>
      </a>
      <a href="download.php?id=${json.id}" target="_blank" rel="external" download="">
        ${json.docname}
      </a>
    </p>
  `;
  return html;
}

const uploadFiles = (file, i) => {
  const fileID = i;
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('loadstart', event => {
    const progressbars = progressbar(i, file.name);
    progressWrapper.insertAdjacentHTML('afterbegin', progressbars);
  });
  
  xhr.upload.addEventListener('progress', event => {
    const progressStatus = document.getElementById(`progress-status-${fileID}`);
    const progressBar = document.getElementById(`progress-bar-${fileID}`);
    let percent = (event.loaded / event.total) * 100;
    
    progressStatus.innerText = (Math.round(percent)) + '% uploaded';
    progressBar.style.width = `${percent}%`;
  });
  
  xhr.addEventListener('loadend', event => {
    if(xhr.status === 200) {
      fileupload.value = '';
      const el = document.querySelector(`#progress-bar-${fileID}`);
      const response = JSON.parse(xhr.responseText);

      el.classList.remove('active');
      el.classList.add('finish');
      
      const MyPromise = new Promise( (resolve, reject) => {
        setTimeout( () => { el.remove(); }, 1000);
      });

      MyPromise
      .then(moveToFileList(response))
      .then( () => {
        document.getElementById(`progress-${fileID}`).remove();
      });

      // setTimeout(function(){
      //   el.remove();
      // },1000);
      // moveToFileList(response);
      // document.getElementById(`progress-${fileID}`).remove();
      console.log(JSON.parse(xhr.responseText));
    }
  });

  const moveToFileList = json => {
    const html = filelist(json);
    fileList.insertAdjacentHTML('afterbegin', html);
    return json;
  }

  xhr.addEventListener('error', event => {

  });

  xhr.open('POST', `${target}.php`);
  const formData = new FormData();
  formData.append('file', file);
  xhr.send(formData);
}

