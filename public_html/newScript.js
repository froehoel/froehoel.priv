class Uploader {
  constructor() {
    this.fileList           = document.getElementById('fileList');
    this.fileUploadLabel    = document.getElementById('fileUploadLabel');
    this.message            = this.fileUploadLabel.dataset.message;
    this.fileUploadBtn      = document.getElementById('fileUploadBtn');
    this.fileUploadProgress = document.getElementById('fileUploadProgress');
    this.target             = this.fileUploadBtn.dataset.target;
    this.numberOfUploads    = 0;

    this.addEventListeners();
  }

  addEventListeners = () => {
    this.fileUploadBtn.addEventListener('click', this.emptyFileList);
    this.fileUploadBtn.addEventListener('change', this.uploadSetup);

    "drag dragstart dragend dragover dragenter dragleave drop".split(" ").forEach( e => {
      this.fileUploadLabel.addEventListener(e, event => {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    "dragover dragenter".split(" ").forEach(e => {
      this.fileUploadLabel.addEventListener(e, () => {
        this.fileUploadLabel.classList.add('is-dragover');
      });
    });

    "dragleave dragend drop".split(" ").forEach(e => {
      this.fileUploadLabel.addEventListener(e, () => {
        this.fileUploadLabel.classList.remove('is-dragover');
      });
    });
    this.fileUploadLabel.addEventListener('drop', this.uploadSetup);
  }

  emptyFileList = () => {
    if(this.fileUploadProgress.childNodes.length) {
      while(this.fileUploadProgress.firstChild) {
        this.fileUploadProgress.removeChild(this.fileUploadProgress.lastChild);
      }
    }
  }

  uploadSetup = (event) => {
    const target = event.type === 'drop' ? event.dataTransfer : event.target;
    const number_of_files = target.files.length;
    this.numberOfUploads = number_of_files;
    if(number_of_files) {
      this.showFiles(target.files);
      for(let i = 0; i < number_of_files; i++) {
        this.uploadFiles(target.files[i], i);
      }
    }
  }

  uploadFiles = (file, index) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.open('POST', `${this.target}.php`);
    formData.append('file', file);

    xhr.upload.addEventListener('loadstart', (event) => {
      this.insertProgressBar(file, index);
    });

    xhr.upload.addEventListener('progress', (event) => {
      this.updateUploadProgress(event, index);
    });

    xhr.addEventListener('loadend', (event) => {
      this.uploadFinish(xhr, index);
    });

    xhr.send(formData);
  }

  uploadFinish = (xhr, index) => {
    if(xhr.status === 200) {
      this.fileUploadBtn.value = '';
      const pBar               = document.getElementById(`progress-bar-${index}`);
      const pItem              = document.getElementById(`progress-${index}`);
      const response           = JSON.parse(xhr.responseText);
      this.numberOfUploads    -= 1;

      pBar.classList.remove('active');
      pBar.classList.add('finish');

      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.removeProgressBar(pBar, index));
        }, 1000)
      })
      .then( (index) => {
        setTimeout( () => {
          pItem.remove();
        }, 1000);
      })
      .then( () => {
        this.moveToFileList(response, index);
        if(this.numberOfUploads === 0) {
          this.fileUploadLabel.dataset.message = this.message;
        } else {
          this.fileUploadLabel.dataset.message = `${this.numberOfUploads} filer i køen`;
        }
      })
    }
  }

  showFiles = files => {
    this.fileUploadLabel.dataset.message = (files.length > 1) ? `${files.length} filer i køen` : `${files[0].name}`;
  }

  removeProgressBar = (el, index) => {
    el.remove();
    return index;
  }

  updateUploadProgress = (event, index) => {
    const progressStatus = document.getElementById(`progress-status-${index}`);
    const progressBar = document.getElementById(`progress-bar-${index}`);
    let percent = (event.loaded / event.total) * 100;

    progressStatus.innerText = (Math.round(percent)) + '% uploaded';
    progressBar.style.width = `${percent}%`;
}

  insertProgressBar = (file, index) => {
    const pb = this.createProgressbar(index, file.name);
    this.fileUploadProgress.insertAdjacentHTML('afterbegin', pb);
  }

  createProgressbar = (index, filename) => {
    const html = `
      <div class="progressItem" id="progress-${index}">
        <div class="progress-bar active" id="progress-bar-${index}" role="progressbar" aria-valuemax="100" style="width: 0; height: 2px;"></div>
        <div class="progress-status"><span class="progress-filename" id="progress-filename-${index}">${filename}</span> <span id="progress-status-${index}">0</span></div>
      </div>
    `;
    return html;
  }

  createFilelist = (json) => {
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

  moveToFileList = (json, index) => {
    const html = this.createFilelist(json);
    this.fileList.insertAdjacentHTML('afterbegin', html);
    return index;
  }
}
new Uploader();
