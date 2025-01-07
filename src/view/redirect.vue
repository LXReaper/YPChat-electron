<script>
export default {
  name: "RedirectComponent",
  created() {
    const { params, query } = this.$route;
    const { path } = params;
    this.$router.replace({ path: "/" + path, query }); //重定位到新的路径
  },
  render: function (h) {
    return h(); // avoid warning Message
  },
};
</script>
