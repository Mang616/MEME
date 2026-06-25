Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    guide: {
      type: Object,
      value: null,
    },
  },

  methods: {
    close() {
      this.triggerEvent('close')
    },

    onMaskTap() {
      this.close()
    },

    onConfirm() {
      this.close()
    },
  },
})
