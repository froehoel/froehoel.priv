class Uploader {
  constructor() {
    this.fileList = document.getElementById('fileList');
    this.fileUploadLabel = document.getElementById('fileUploadLabel');
    this.fileUploadBtn = document.getElementById('fileUploadBtn');
    this.fileUploadProgress = document.getElementById('fileUploadProgress');
    this.target = this.fileUploadBtn.dataset.target;

    this.addEventListeners();
  }

  addEventListeners() {
    this.fileUploadBtn.addEventListener('click', event => { 
      this.emptyFileList();
    });

    this.fileUploadBtn.addEventListener('change', event => {
      const number_of_files = this.fileUploadBtn.files.length;
      if(number_of_files) {
        for(let i = 0; i < number_of_files; i++) {
          this.uploadFiles(this.fileUploadBtn.files[i], i);
        }
      }
    });
  }

  uploadFiles = function(file, i) {
    console.log('uploadFiles:', this);
    const fileID = i;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    xhr.open('POST', `${this.target}.php`);
    formData.append('file', file);
    
    xhr.upload.addEventListener('loadstart', (event) => {
      this.insertProgressBar(file, i);
    });
    
    xhr.upload.addEventListener('progress', (event) => {
      const progressStatus = document.getElementById(`progress-status-${fileID}`);
      const progressBar = document.getElementById(`progress-bar-${fileID}`);
      let percent = (event.loaded / event.total) * 100;
      
      progressStatus.innerText = (Math.round(percent)) + '% uploaded';
      progressBar.style.width = `${percent}%`;
    });

    xhr.addEventListener('loadend', (event) => {
      if(xhr.status === 200) {
        this.fileUploadBtn.value = '';
        const el = document.querySelector(`#progress-bar-${fileID}`);
        const response = JSON.parse(xhr.responseText);
  
        el.classList.remove('active');
        el.classList.add('finish');
        
        const MyPromise = new Promise( (resolve, reject) => {
          setTimeout( () => resolve(el.remove()), 1000);
        });

        MyPromise
        .then(() => {
          return new Promise((resolve, reject) => {
            resolve(this.moveToFileList(response));
          });
        })
        .then( () => {
          setTimeout( () => document.getElementById(`progress-${fileID}`).remove(), 1000);
        });
      }
    });

    xhr.send(formData);
  }

  emptyFileList() {
    if(this.fileUploadProgress.childNodes.length) {
      while(this.fileUploadProgress.firstChild) {
        this.fileUploadProgress.removeChild(this.fileUploadProgress.lastChild);
      }
    }
  }

  insertProgressBar(file, index) {
    const pb = this.createProgressbar(index, file.name);
    this.fileUploadProgress.insertAdjacentHTML('afterbegin', pb);
  }

  createProgressbar(fileID, filename) {
    const html = `
      <div class="progressItem" id="progress-${fileID}">
        <div class="progress-bar active" id="progress-bar-${fileID}" role="progressbar" aria-valuemax="100" style="width: 0; height: 2px;"></div>
        <div class="progress-status"><span class="progress-filename" id="progress-filename-${fileID}">${filename}</span> <span id="progress-status-${fileID}">0</span></div>
      </div>
    `;
    return html;
  }

  createFilelist(json) {
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
  moveToFileList(json) {
    const html = this.createFilelist(json);
    this.fileList.insertAdjacentHTML('afterbegin', html);
    return json;
  }
}

new Uploader();