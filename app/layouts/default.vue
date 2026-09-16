<template>
    <v-layout class="tw:h-screen">
        <edit-profile />

        <app-header />

        <v-main class="tw:h-full">
            <div class="tw:relative!">
                <page-header />
            </div>

            <div
                class="tw:h-full tw:overflow-y-auto tw:overflow-x-hidden custom-scroll tw:p-4!"
            >
                <!-- Page Content -->
                <div class="tw:relative">
                    <slot />
                </div>
            </div>
        </v-main>
    </v-layout>
</template>

<script setup lang="ts">
</script>
