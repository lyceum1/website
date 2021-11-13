CMS.registerEditorComponent({
    id: 'image',
    label: 'Зображення',
    fields: [
        {
            label: 'Файл',
            name: 'file',
            widget: 'image',
            media_library: {
                allow_multiple: false,
            },
        },
        {
            label: 'Розмір',
            name: 'ratio',
            widget: 'image',
            widget: 'select',
            options: [
                { label: 'Звичайний', value: '16to9' },
                { label: 'Великий', value: 'A4' },
            ],
            default: ['16to9'],
        }
    ],
    pattern: /{{< image file="(.+?)" ratio="(.+?)" >}}/,
    fromBlock: (match) => {
        return {
            file: match[1],
            ratio: match[2],
        };
    },
    toBlock: ({ file, ratio }) => {
        return `{{< image file="${file}" ratio="${ratio}" >}}`;
    },
    toPreview: ({ file, ratio }, getAsset, fields) => {
        const imageField = fields?.find(f => f.get('widget') === 'image');
        const src = getAsset(file, imageField);
        return `
            <div class="embed_wrapper r${ratio}">
                <div class="embed">
                    <img src="${src || ''}" alt="" />
                </div>
            </div>
        `;
    },
});
CMS.registerEditorComponent({
    id: 'youtube',
    label: 'YouTube',
    fields: [{
        name: 'id',
        label: 'Ідентифікатор відео',
        widget: 'string'
    }],
    pattern: /{{< youtube "(.+?)" >}}/,
    fromBlock: (match) => {
        return {
            id: match[1],
        };
    },
    toBlock: ({ id }) => {
        return `{{< youtube "${id}" >}}`;
    },
    toPreview: ({ id }) => {
        return `
            <div class="embed_wrapper">
                <div class="embed">
                    <iframe src="//youtube.com/embed/${id}" title="Youtube Video Player" allowfullscreen></iframe>
                </div>
            </div>
        `;
    },
});

CMS.registerEditorComponent({
    id: 'pdfjs',
    label: 'PDF',
    fields: [
        {
            label: 'Файл',
            name: 'file',
            widget: 'file',
            media_library: {
                allow_multiple: false,
            },
        },
        {
            label: 'Розмір',
            name: 'ratio',
            widget: 'select',
            options: [
                { label: 'A4', value: 'A4' },
                { label: '4:3', value: '4to3' },
                { label: '16:9', value: '16to9' },
            ],
            default: ['A4'],
        },
    ],
    pattern: /{{< pdfjs file="(.+?)" ratio="(.+?)" >}}/,
    fromBlock: (match) => {
        return {
            file: match[1],
            ratio: match[2],
        };
    },
    toBlock: ({ file, ratio }) => {
        return `{{< pdfjs file="${file}" ratio="${ratio}" >}}`;
    },
    toPreview: ({ file, ratio }, getAsset, fields) => {
        const fileField = fields?.find(f => f.get('widget') === 'file');
        const src = getAsset(file, fileField);
        const id = Math.floor(Math.random() * 1000000);
        return `
            <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.9.359/build/pdf.min.js" integrity="sha256-hEmjt7z3bB53X/awJyV81gmBLpVw2mj7EsvoJelZWow=" crossorigin="anonymous"></script>
            <div class="embed_wrapper r${ratio}">
                <div class="embed">
                    <canvas id="canvas_${id}"></canvas>
                </div>
                <ul class="pager paginator">
                    <li><a role="button" id="prev_${id}">ᐊ</a></li>
                    <li><a role="button" id="next_${id}">ᐅ</a></li>
                    &nbsp;
                    <li><a href="${file}" target="_blank"><i class="fas fa-external-link-alt"></i> PDF</a></li>
                </ul>
            </div>

            <!--
            <script type="text/javascript">
                window.addEventListener("load", function() {
                    // Loaded via <script> tag, create shortcut to access PDF.js exports.
                    const pdfjsLib = window['pdfjs-dist/build/pdf'];

                    // The workerSrc property shall be specified.
                    pdfjsLib
                        .GlobalWorkerOptions
                        .workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.9.359/build/pdf.worker.min.js";

                    // Change the scale value for lower or higher resolution.
                    let pdfDoc = null;
                    let pageNum = 1;
                    let pageRendering = false;
                    let pageNumPending = null;
                    const scale = 3;
                    const canvas = document.getElementById('canvas_${id}');
                    const ctx = canvas.getContext('2d');

                    /**
                     * Get page info from document, resize canvas accordingly, and render page.
                     * @param num Page number.
                     */
                    function renderPage(num) {
                        pageRendering = true;

                        // Using promise to fetch the page.
                        pdfDoc
                            .getPage(num)
                            .then(function(page) {
                                const viewport = page.getViewport({scale: scale});
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                // Render PDF page into canvas context.
                                const renderContext = {
                                    canvasContext: ctx,
                                    viewport: viewport
                                };

                                // Wait for rendering to finish.
                                page.render(renderContext)
                                    .promise
                                    .then(function() {
                                        pageRendering = false;
                                        if (pageNumPending !== null) {
                                            // New page rendering is pending.
                                            renderPage(pageNumPending);
                                            pageNumPending = null;
                                        }
                                    });
                            });
                    }

                    /**
                     * If another page rendering in progress, waits until the rendering is
                     * finised. Otherwise, executes rendering immediately.
                     */
                    function queueRenderPage(num) {
                        if (pageRendering) {
                            pageNumPending = num;
                        } else {
                            renderPage(num);
                        }
                    }

                    /**
                     * Displays previous page.
                     */
                    function onPrevPage() {
                        if (pageNum <= 1) {
                            return;
                        }

                        --pageNum;
                        queueRenderPage(pageNum);
                    }

                    document
                        .getElementById('prev_${id}')
                        .addEventListener('click', onPrevPage);

                    /**
                     * Displays next page.
                     */
                    function onNextPage() {
                        if (pageNum >= pdfDoc.numPages) {
                            return;
                        }

                        ++pageNum;
                        queueRenderPage(pageNum);
                    }

                    document
                        .getElementById('next_${id}')
                        .addEventListener('click', onNextPage);

                    /**
                     * Asynchronously downloads PDF.
                     */
                    fetch('${src}')
                        .then(response => response.blob())
                        .then(blob => {
                            pdfjsLib
                                .getDocument({data: blob.text()})
                                .promise
                                .then(value => {
                                    // Initial/first page rendering.
                                    pdfDoc = value;
                                    renderPage(pageNum);
                                });
                        });
                });
            </script>
            -->
        `;
    },
});

function makeDate(date) {
    const year = new Intl.DateTimeFormat('uk', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('uk', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('uk', { day: '2-digit' }).format(date);
    return `${day} ${month.toLowerCase()} ${year}`;
}

const newsPreview = createClass({
    render: function() {
        const entry = this.props.entry;
        const date = new Date(entry.getIn(['data', 'date']))
        return h('div', {id: 'all'},
            h('div', {id: 'heading-breadcrumbs'},
                h('div', {className: 'container-fluid'},
                    h('div', {className: 'row'},
                        h('div', {className: 'col-md-12'},
                            h('h1', {}, entry.getIn(['data', 'title']))
                        )
                    )
                )
            ),
            h('div', {id: 'content'},
                h('div', {className: 'container-fluid'},
                    h('div', {className: 'row'}, 
                        h('div', {className: 'col-md-12', id: 'blog-post'},
                            h('p', {className: 'text-muted mb-small text-right'},
                                h('i', {className: 'far fa-calendar'}),
                                ` ${makeDate(date)}`
                            ),
                            h('div', {id: 'post-content'},
                                this.props.widgetFor('body')
                            )
                        )
                    )
                )
            )
        );
    }
});

const pagePreview = createClass({
    render: function() {
        const entry = this.props.entry;
        return h('div', {id: 'all'},
            h('div', {id: 'heading-breadcrumbs'},
                h('div', {className: 'container-fluid'},
                    h('div', {className: 'row'},
                        h('div', {className: 'col-md-12'},
                            h('h1', {}, entry.getIn(['data', 'title']))
                        )
                    )
                )
            ),
            h('div', {id: 'content'},
                h('div', {className: 'container-fluid'},
                    h('div', {className: 'row'}, 
                        h('div', {className: 'col-md-12', id: 'blog-post'},
                            h('div', {id: 'post-content'},
                                this.props.widgetFor('body')
                            )
                        )
                    )
                )
            )
        );
    }
});

function makeSlug(input) {
    if (!input) {
        return "";
    }

    const firstAssociations = {
        "а": "a",
        "б": "b",
        "в": "v",
        "д": "d",
        "з": "z",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "ь": "",
        "г": "h",
        "ґ": "g",
        "е": "e",
        "и": "y",
        "і": "i",
        "ж": "zh",
        "х": "kh",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "shch",
        "ю": "yu",
        "я": "ya",
        "є": "ye",
        "ї": "yi",
    };

    const rest = Object.assign({}, firstAssociations, {
        "й": "i",
        "ї": "i",
        "є": "ie",
        "ю": "iu",
        "я": "ia",
    });

    // We must normalize string for transform all unicode chars to uniform form.
    // Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    const normalized = input.normalize();

    let result = '';
    let isWordBoundary = false;
    for (let i = 0; i < normalized.length; ++i) {
        const letter = normalized[i].toLowerCase();

        if (letter === ' ') {
            result += '-';
            isWordBoundary = true;
            continue;
        }

        let newLetter;
        if (normalized.slice(i - 1, i + 1).toLowerCase() === "зг") {
            newLetter = "gh";
        } else if (i === 0 || isWordBoundary) {
            newLetter = firstAssociations[letter];
            isWordBoundary = false;
        } else {
            newLetter = rest[letter];
        }

        if (!newLetter) {
            if (letter.match(/[a-z0-9_-]/i)) {
                result += letter;
            }
        } else {
            result += newLetter;
        }
    }

    return result;
}

CMS.registerEventListener({
    name: 'preSave',
    handler: ({ entry }) => {
        if (entry.get('collection') === 'news') {
            return entry.get('data').set('slug', makeSlug(entry.get('data').get('title')))
        }

        return entry.get('data');
    },
});
CMS.registerPreviewStyle('//use.fontawesome.com/releases/v5.11.2/css/all.css');
CMS.registerPreviewStyle('//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');
CMS.registerPreviewStyle('/css/style.green.css');
CMS.registerPreviewStyle('/css/custom.css');
CMS.registerPreviewTemplate('news', newsPreview);
for (const collection of ['about', 'study']) {
    CMS.registerPreviewTemplate(collection, pagePreview);
}
