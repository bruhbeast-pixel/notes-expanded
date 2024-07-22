document.addEventListener("DOMContentLoaded", function() {
    const notepadContainer = document.getElementById('notepad-container');
    const noteInput = document.getElementById('note-input');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const trashCan = document.getElementById('trash-can');

    let zIndexCounter = 1;

    // Drag and drop functionality for notes
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Create a new note element
    function createNote(noteText) {
        const note = document.createElement('div');
        note.classList.add('note');
        note.style.top = `${Math.random() * 70 + 20}%`;
        note.style.left = `${Math.random() * 70 + 20}%`;
        note.style.zIndex = zIndexCounter++;
        
        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.textContent = noteText;

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.classList.add('color-picker');
        colorPicker.value = '#ffff00'; // Default to yellow
        note.appendChild(colorPicker);

        note.appendChild(noteContent);
        notepadContainer.appendChild(note);

        makeDraggable(note);

        // Change note bubble color on color picker change
        colorPicker.addEventListener('input', function() {
            note.style.backgroundColor = colorPicker.value;
        });

        // Delete note when dragged to trash can
        note.addEventListener('mouseup', function(e) {
            const trashRect = trashCan.getBoundingClientRect();
            const noteRect = note.getBoundingClientRect();
            if (noteRect.right >= trashRect.left && noteRect.left <= trashRect.right &&
                noteRect.bottom >= trashRect.top && noteRect.top <= trashRect.bottom) {
                notepadContainer.removeChild(note);
            }
        });
    }

    // Event listener for adding a note
    noteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && noteInput.value.trim() !== '') {
            createNote(noteInput.value.trim());
            noteInput.value = '';
        }
    });

    // Export notes as a text file
    exportBtn.addEventListener('click', function() {
        const notes = Array.from(notepadContainer.getElementsByClassName('note'))
                      .map(note => note.querySelector('.note-content').textContent.trim())
                      .join('\n');
        const blob = new Blob([notes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import notes from a text file
    importBtn.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const notes = e.target.result.split('\n').filter(note => note.trim() !== '');
            notes.forEach(note => createNote(note.trim()));
        };
        reader.readAsText(file);
    });
});