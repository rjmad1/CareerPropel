module.exports = {
  forbidden: [
    {
      name: "web-runtime-cannot-import-worker",
      severity: "error",
      from: {
        path: "^src/app|^src/bin/web"
      },
      to: {
        path: "^src/bin/worker|^src/lib/queue/worker"
      }
    },
    {
      name: "ui-no-infra-imports",
      severity: "error",
      from: {
        path: "^src/components|^src/domains/(?!.*/workers/)"
      },
      to: {
        path: "^src/lib/redis|^src/lib/queue"
      }
    }
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: [
        '\\.next',
        'node_modules'
      ]
    }
  }
};
