CMS.registerEditorComponent({
    id: 'image',
    label: 'Зображення',
    fields: [{
        label: 'Файл',
        name: 'image',
        widget: 'image',
        media_library: {
          allow_multiple: false,
        },
    }],
    pattern: /{{< image "(.+?)" >}}/,
    fromBlock: function(match){
        return {
            image: match[1]
        };
    },
    toBlock: ({ image }) => {
        return `{{< image "${image}" >}}`;
    },
    toPreview: ({ image }, getAsset, fields) => {
        const imageField = fields?.find(f => f.get('widget') === 'image');
        const src = getAsset(image, imageField);
        return `
            <div class="embed_wrapper">
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
    fromBlock: function(match) {
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
    id: 'document',
    label: 'Документ',
    fields: [
        {
            label: 'Файл',
            name: 'document',
            widget: 'file',
            media_library: {
                allow_multiple: false,
            },
        },
        {
            label: 'Орієнтація',
            name: 'orientation',
            widget: 'select',
            options: [
                { label: 'Альбомна', value: 'album' },
                { label: 'Портретна', value: 'portrait' }
            ],
            default: ['album']
        }
    ],
    pattern: /{{< document "(.+?)" "(.+?)" >}}/,
    fromBlock: (match) => {
        return match && {
            document: match[1],
            orientation: match[2]
        };
    },
    toBlock: ({ document, orientation }) => {
        return `{{< document "${document}" "${orientation}" >}}`;
    },
    toPreview: ({ document, orientation }, getAsset, fields) => {
        const fileField = fields?.find(f => f.get('widget') === 'file');
        const src = getAsset(document, fileField);
        const presentation = ['pptx', 'ppt'].find(ext => src?.url.endsWith(ext));
        const image = ['png', 'jpg', 'jpeg'].find(ext => src?.url.endsWith(ext));
        return `
            <div class="embed_wrapper ${orientation} ${presentation ? 'presentation' : ''}">
                <div class="embed">
                ${
                    image 
                        ? `<img src="${src || ''}" alt=""></img>`
                        : `<iframe allowfullscreen frameborder="0"
                              src="${presentation ? '//view.officeapps.live.com/op/embed.aspx?src=' : '//docs.google.com/viewer?embedded=true&url='}${src || ''}">
                          </iframe>`
                }
                </div>
            </div>
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

CMS.registerPreviewStyle('//use.fontawesome.com/releases/v5.11.2/css/all.css');
CMS.registerPreviewStyle('//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');
CMS.registerPreviewStyle('/css/style.green.css');
CMS.registerPreviewStyle('/css/custom.css');
CMS.registerPreviewTemplate('news', newsPreview);
for (const collection of ['about', 'study']) {
    CMS.registerPreviewTemplate(collection, pagePreview);
}
