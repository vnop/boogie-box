module.exports = function(grunt) {

  grunt.initConfig({
    shell: {
      'compile': {
        command: 'babel ./client/src --out-dir ./client/compiled --presets=es2015,react --source-maps inline'
      }
    },

    nodemon: {
      dev: {
        script: 'server/server.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('compile', ['shell:compile']);
  grunt.registerTask('start', ['nodemon:dev']);
  grunt.registerTask('default', ['compile', 'start']);

}